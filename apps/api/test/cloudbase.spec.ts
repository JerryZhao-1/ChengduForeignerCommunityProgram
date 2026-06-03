import { describe, expect, it } from "vitest";

import { main } from "../src/cloudbase";
import { createCloudbaseProvider } from "../src/providers/cloudbase";
import { createMockProvider } from "../src/providers/mock";

describe("cloudbase event handler", () => {
  it("returns event list with the same envelope shape", async () => {
    const response = await main(
      {},
      {
        eventID: "req_cloud_001",
        httpContext: {
          url: "http://localhost/events",
          httpMethod: "GET",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      } as any
    );

    expect(response.statusCode).toBe(200);
    expect((response.body as any).success).toBe(true);
    expect((response.body as any).data.items.length).toBeGreaterThan(0);
  });

  it("returns places list, detail, and markers in cloudbase mode", async () => {
    process.env.API_PROVIDER = "cloudbase";

    try {
      const listResponse = await main(
        {},
        {
          eventID: "req_cloud_002",
          httpContext: {
            url: "http://localhost/places?communityId=tongzilin&keyword=community&category=public-service&recommended=true&sort=recommended&page=1&pageSize=1",
            httpMethod: "GET"
          }
        } as any
      );
      const listBody = listResponse.body as any;

      expect(listResponse.statusCode).toBe(200);
      expect(listBody.success).toBe(true);
      expect(listBody.data.page).toBe(1);
      expect(listBody.data.pageSize).toBe(1);
      expect(listBody.data.total).toBe(1);
      expect(
        listBody.data.items.every(
          (item: { category_level_1: string; is_recommended: boolean }) =>
            item.category_level_1 === "public-service" && item.is_recommended
        )
      ).toBe(true);
      expect(listBody.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(listBody.data.items[0]).not.toHaveProperty("navigation");
      expect(listBody.data.items[0]).not.toHaveProperty("address_zh");

      const placeId = listBody.data.items[0]._id;
      const detailResponse = await main(
        {},
        {
          eventID: "req_cloud_003",
          httpContext: {
            url: `http://localhost/places/${placeId}`,
            httpMethod: "GET"
          }
        } as any
      );
      const detailBody = detailResponse.body as any;

      expect(detailResponse.statusCode).toBe(200);
      expect(detailBody.data).toHaveProperty("navigation");
      expect(detailBody.data).toHaveProperty("gallery_urls");

      const markerResponse = await main(
        {},
        {
          eventID: "req_cloud_004",
          httpContext: {
            url: "http://localhost/places/map-markers",
            httpMethod: "GET"
          }
        } as any
      );
      const markerBody = markerResponse.body as any;

      expect(markerResponse.statusCode).toBe(200);
      expect(markerBody.data).toHaveLength(2);
      expect(Object.keys(markerBody.data[0]).sort()).toEqual([
        "_id",
        "category_level_1",
        "is_recommended",
        "location",
        "name_en",
        "name_zh"
      ]);
      expect(markerBody.data.map((item: { _id: string }) => item._id)).toEqual([
        "place_001",
        "place_002"
      ]);
      expect(markerBody.data[0]).not.toHaveProperty("navigation");
      expect(markerBody.data[0]).not.toHaveProperty("gallery_urls");
      expect(markerBody.data[0]).not.toHaveProperty("address_zh");

      const invalidSortResponse = await main(
        {},
        {
          eventID: "req_cloud_004_invalid_sort",
          httpContext: {
            url: "http://localhost/places?sort=latest",
            httpMethod: "GET"
          }
        } as any
      );
      const invalidSortBody = invalidSortResponse.body as any;

      expect(invalidSortResponse.statusCode).toBe(400);
      expect(invalidSortBody.error.code).toBe("VALIDATION_ERROR");
    } finally {
      delete process.env.API_PROVIDER;
    }
  });

  it("keeps places query semantics aligned between mock and cloudbase providers", async () => {
    const mockProvider = createMockProvider();
    const cloudbaseProvider = createCloudbaseProvider();

    const query = {
      communityId: "tongzilin",
      category: "public-service",
      page: 1,
      pageSize: 1,
      recommended: true,
      sort: "recommended" as const
    };

    const [mockList, cloudbaseList, mockMarkers, cloudbaseMarkers] =
      await Promise.all([
        mockProvider.places.list(query),
        cloudbaseProvider.places.list(query),
        mockProvider.places.mapMarkers(),
        cloudbaseProvider.places.mapMarkers()
      ]);

    expect(cloudbaseList).toEqual(mockList);
    expect(cloudbaseMarkers).toEqual(mockMarkers);
    expect(cloudbaseList.pageSize).toBe(1);
    expect(
      cloudbaseList.items.every(
        (item) => item.category_level_1 === "public-service"
      )
    ).toBe(true);

    const mockDetail = await mockProvider.places.detail(mockList.items[0]._id);
    const cloudbaseDetail = await cloudbaseProvider.places.detail(
      cloudbaseList.items[0]._id
    );

    expect(cloudbaseDetail).toEqual(mockDetail);
  });

  it("excludes published places with unusable coordinates from mock markers", async () => {
    const mockProvider = createMockProvider();

    await mockProvider.places.create({
      name_zh: "无效坐标地点",
      name_en: "Invalid Coordinate Place",
      category_level_1: "community",
      category_level_2: "test",
      tag_ids: [],
      address_zh: "成都",
      address_en: "Chengdu",
      location: {
        latitude: 91,
        longitude: 104.0625
      },
      business_hours_zh: "周一至周日",
      business_hours_en: "Every day",
      intro_zh: "测试",
      intro_en: "Test",
      recommended_reason_zh: null,
      recommended_reason_en: null,
      is_recommended: true,
      recommended_rank: 0,
      gallery_file_ids: [],
      gallery_urls: [],
      tencent_map_poi_id: null,
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      status: "published"
    });

    const markers = await mockProvider.places.mapMarkers();

    expect(markers.some((item) => item.name_en === "Invalid Coordinate Place")).toBe(
      false
    );
  });

  it("supports admin places metadata flows in cloudbase mode", async () => {
    process.env.API_PROVIDER = "cloudbase";

    try {
      const createResponse = await main(
        {
          name_zh: "云函数地点草稿",
          name_en: "Cloud Function Draft Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都高新区",
          address_en: "Chengdu High-tech Zone",
          location: { latitude: 30.619, longitude: 104.066 },
          business_hours_zh: "周一至周五",
          business_hours_en: "Mon-Fri",
          intro_zh: "草稿",
          intro_en: "Draft",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: "poi_cloud_001",
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "draft"
        },
        {
          eventID: "req_cloud_005",
          httpContext: {
            url: "http://localhost/admin/places",
            httpMethod: "POST",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        } as any
      );
      const createBody = createResponse.body as any;

      expect(createResponse.statusCode).toBe(201);
      expect(createBody.data.category_level_1).toBe("community");
      expect(createBody.data.status).toBe("draft");

      const draftListResponse = await main(
        {},
        {
          eventID: "req_cloud_005_public_draft_list",
          httpContext: {
            url: "http://localhost/places?keyword=Cloud%20Function%20Draft%20Place",
            httpMethod: "GET"
          }
        } as any
      );
      const draftListBody = draftListResponse.body as any;

      expect(draftListResponse.statusCode).toBe(200);
      expect(draftListBody.data.items).toEqual([]);
      expect(draftListBody.data.total).toBe(0);

      const updateResponse = await main(
        {
          category_level_1: "transport",
          category_level_2: "metro-station",
          location: { latitude: 30.6201, longitude: 104.0673 },
          tencent_map_poi_id: "poi_cloud_002",
          is_recommended: true,
          recommended_reason_zh: "云函数推荐理由",
          recommended_reason_en: "Cloud recommendation reason",
          recommended_rank: 4,
          status: "published"
        },
        {
          eventID: "req_cloud_006",
          httpContext: {
            url: `http://localhost/admin/places/${createBody.data._id}`,
            httpMethod: "PATCH",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        } as any
      );
      const updateBody = updateResponse.body as any;

      expect(updateResponse.statusCode).toBe(200);
      expect(updateBody.data.category_level_1).toBe("transport");
      expect(updateBody.data.category_level_2).toBe("metro-station");
      expect(updateBody.data.location).toEqual({
        latitude: 30.6201,
        longitude: 104.0673
      });
      expect(updateBody.data.tencent_map_poi_id).toBe("poi_cloud_002");
      expect(updateBody.data.recommended_rank).toBe(4);
      expect(updateBody.data.status).toBe("published");

      const listResponse = await main(
        {},
        {
          eventID: "req_cloud_007",
          httpContext: {
            url: "http://localhost/admin/places",
            httpMethod: "GET",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        } as any
      );
      const listBody = listResponse.body as any;

      expect(listResponse.statusCode).toBe(200);
      expect(
        listBody.data.items.some(
          (item: { _id: string; category_level_1: string; status: string }) =>
            item._id === createBody.data._id &&
            item.category_level_1 === "transport" &&
            item.status === "published"
        )
      ).toBe(true);

      const detailResponse = await main(
        {},
        {
          eventID: "req_cloud_008",
          httpContext: {
            url: `http://localhost/places/${createBody.data._id}`,
            httpMethod: "GET"
          }
        } as any
      );
      const detailBody = detailResponse.body as any;

      expect(detailResponse.statusCode).toBe(200);
      expect(detailBody.data.category_level_1).toBe("transport");

      const markerResponse = await main(
        {},
        {
          eventID: "req_cloud_009",
          httpContext: {
            url: "http://localhost/places/map-markers",
            httpMethod: "GET"
          }
        } as any
      );
      const markerBody = markerResponse.body as any;

      expect(markerResponse.statusCode).toBe(200);
      expect(
        markerBody.data.some(
          (item: { _id: string; category_level_1: string }) =>
            item._id === createBody.data._id &&
            item.category_level_1 === "transport"
        )
      ).toBe(true);
    } finally {
      delete process.env.API_PROVIDER;
    }
  });
});
