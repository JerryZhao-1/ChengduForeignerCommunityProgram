import { describe, expect, it, vi } from "vitest";

import {
  FILE_PATH_RULES,
  createMockDataset,
  type Place
} from "@community-map/shared";
import { main } from "../src/cloudbase";
import { createCloudbaseProvider } from "../src/providers/cloudbase";
import { createMockProvider } from "../src/providers/mock";

describe("cloudbase event handler", () => {
  it("returns event list with the same envelope shape", async () => {
    const response = await main({}, {
      eventID: "req_cloud_001",
      httpContext: {
        url: "http://localhost/events",
        httpMethod: "GET",
        headers: {
          "x-mock-user-id": "user_001"
        }
      }
    } as any);

    expect(response.statusCode).toBe(200);
    expect((response.body as any).success).toBe(true);
    expect((response.body as any).data.items.length).toBeGreaterThan(0);
  });

  it("supports admin event list and registrations with the /api prefix", async () => {
    const listResponse = await main({}, {
      eventID: "req_cloud_admin_events",
      httpContext: {
        url: "http://localhost/api/admin/events",
        httpMethod: "GET",
        headers: {
          "x-mock-user-id": "user_001"
        }
      }
    } as any);
    const listBody = listResponse.body as any;

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.success).toBe(true);
    expect(
      listBody.data.items.map((event: { _id: string }) => event._id)
    ).toEqual(
      expect.arrayContaining(["event_001", "event_draft", "event_offline"])
    );
    expect(listBody.data.items[0]).toHaveProperty("remaining_capacity");

    const registrationsResponse = await main({}, {
      eventID: "req_cloud_admin_event_registrations",
      httpContext: {
        url: "http://localhost/api/admin/events/event_001/registrations",
        httpMethod: "GET",
        headers: {
          "x-mock-user-id": "user_001"
        }
      }
    } as any);
    const registrationsBody = registrationsResponse.body as any;

    expect(registrationsResponse.statusCode).toBe(200);
    expect(registrationsBody.success).toBe(true);
    expect(registrationsBody.data[0]).toMatchObject({
      ticket_id: "ticket_001",
      ticket_code: "TZL-20260402-001",
      ticket_status: "valid"
    });

    const forbiddenResponse = await main({}, {
      eventID: "req_cloud_admin_events_forbidden",
      httpContext: {
        url: "http://localhost/api/admin/events",
        httpMethod: "GET",
        headers: {
          "x-mock-user-id": "user_002"
        }
      }
    } as any);
    const forbiddenBody = forbiddenResponse.body as any;

    expect(forbiddenResponse.statusCode).toBe(403);
    expect(forbiddenBody.error.code).toBe("FORBIDDEN");

    const createResponse = await main(
      {
        title_zh: "CloudBase 删除测试活动",
        title_en: "CloudBase Delete Test Event",
        summary_zh: "简介",
        summary_en: "Summary",
        content_zh: "正文",
        content_en: "Body",
        address_text: "桐梓林",
        location: { latitude: 30.615, longitude: 104.062 },
        start_time: "2027-04-02T10:00:00+08:00",
        end_time: "2027-04-02T12:00:00+08:00",
        signup_deadline: "2027-04-01T18:00:00+08:00",
        capacity: 10
      },
      {
        eventID: "req_cloud_admin_event_delete_create",
        httpContext: {
          url: "http://localhost/api/admin/events",
          httpMethod: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      } as any
    );
    const createBody = createResponse.body as any;

    expect(createResponse.statusCode).toBe(201);

    const deleteResponse = await main({}, {
      eventID: "req_cloud_admin_event_delete",
      httpContext: {
        url: `http://localhost/api/admin/events/${createBody.data._id}`,
        httpMethod: "DELETE",
        headers: {
          "x-mock-user-id": "user_001"
        }
      }
    } as any);
    const deleteBody = deleteResponse.body as any;

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteBody.data).toEqual({ deleted_id: createBody.data._id });

    const missingDeleteResponse = await main({}, {
      eventID: "req_cloud_admin_event_delete_missing",
      httpContext: {
        url: "http://localhost/api/admin/events/event_missing_delete",
        httpMethod: "DELETE",
        headers: {
          "x-mock-user-id": "user_001"
        }
      }
    } as any);
    const missingDeleteBody = missingDeleteResponse.body as any;

    expect(missingDeleteResponse.statusCode).toBe(404);
    expect(missingDeleteBody.error.code).toBe("NOT_FOUND");
  });

  it("accepts mini program cloud function style routing metadata", async () => {
    const response = await main(
      {
        $url: "/places/map-markers",
        $method: "GET",
        $headers: {
          "x-mock-user-id": "user_001"
        }
      },
      {
        eventID: "req_cloud_function_style"
      } as any
    );
    const body = response.body as any;

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty("cover_url");
    expect(body.data[0]).toHaveProperty("location");
  });

  it("blocks non-admin place gallery files in cloudbase handler", async () => {
    const uploadResponse = await main(
      {
        biz_type: "place_gallery",
        biz_id: "place_001",
        file_name: "forbidden.jpg",
        visibility: "public",
        target_prefix: FILE_PATH_RULES.placeGallery
      },
      {
        eventID: "req_cloud_forbidden_gallery_upload",
        httpContext: {
          url: "http://localhost/files/upload-requests",
          httpMethod: "POST",
          headers: {
            "x-mock-user-id": "user_002"
          }
        }
      } as any
    );
    const uploadBody = uploadResponse.body as any;

    expect(uploadResponse.statusCode).toBe(403);
    expect(uploadBody.error.code).toBe("FORBIDDEN");

    const completeResponse = await main(
      {
        biz_type: "place_gallery",
        biz_id: "place_001",
        file_id: "cloud://public/places/place_001/forbidden.jpg",
        cloud_path: `${FILE_PATH_RULES.placeGallery}place_001/forbidden.jpg`,
        visibility: "public"
      },
      {
        eventID: "req_cloud_forbidden_gallery_complete",
        httpContext: {
          url: "http://localhost/files/complete",
          httpMethod: "POST",
          headers: {
            "x-mock-user-id": "user_002"
          }
        }
      } as any
    );
    const completeBody = completeResponse.body as any;

    expect(completeResponse.statusCode).toBe(403);
    expect(completeBody.error.code).toBe("FORBIDDEN");
  });

  it("returns places list, detail, and markers in cloudbase mode", async () => {
    process.env.API_PROVIDER = "cloudbase";

    try {
      const listResponse = await main({}, {
        eventID: "req_cloud_002",
        httpContext: {
          url: "http://localhost/places?communityId=tongzilin&keyword=community&category=public-service&tag=service&recommended=true&sort=recommended&page=1&pageSize=1",
          httpMethod: "GET"
        }
      } as any);
      const listBody = listResponse.body as any;

      expect(listResponse.statusCode).toBe(200);
      expect(listBody.success).toBe(true);
      expect(listBody.data.page).toBe(1);
      expect(listBody.data.pageSize).toBe(1);
      expect(listBody.data.total).toBe(1);
      expect(
        listBody.data.items.every(
          (item: {
            category_level_1: string;
            tag_ids: string[];
            is_recommended: boolean;
          }) =>
            item.category_level_1 === "public-service" &&
            item.tag_ids.includes("service") &&
            item.is_recommended
        )
      ).toBe(true);
      expect(listBody.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(listBody.data.items[0]).not.toHaveProperty("gallery_media");
      expect(listBody.data.items[0]).not.toHaveProperty("navigation");
      expect(listBody.data.items[0]).not.toHaveProperty("address_zh");

      const placeId = listBody.data.items[0]._id;
      const detailResponse = await main({}, {
        eventID: "req_cloud_003",
        httpContext: {
          url: `http://localhost/places/${placeId}`,
          httpMethod: "GET"
        }
      } as any);
      const detailBody = detailResponse.body as any;

      expect(detailResponse.statusCode).toBe(200);
      expect(detailBody.data).toHaveProperty("navigation");
      expect(detailBody.data).toHaveProperty("gallery_media");
      expect(detailBody.data).toHaveProperty("gallery_urls");
      expect(detailBody.data.gallery_urls).toEqual(
        detailBody.data.gallery_media.map((media: { url: string }) => media.url)
      );

      const markerResponse = await main({}, {
        eventID: "req_cloud_004",
        httpContext: {
          url: "http://localhost/places/map-markers",
          httpMethod: "GET"
        }
      } as any);
      const markerBody = markerResponse.body as any;

      expect(markerResponse.statusCode).toBe(200);
      expect(markerBody.data).toHaveLength(2);
      expect(Object.keys(markerBody.data[0]).sort()).toEqual([
        "_id",
        "category_level_1",
        "cover_url",
        "is_recommended",
        "location",
        "name_en",
        "name_zh"
      ]);
      expect(markerBody.data[0].cover_url).toBe(
        "https://images.unsplash.com/photo-1494526585095-c41746248156"
      );
      expect(markerBody.data.map((item: { _id: string }) => item._id)).toEqual([
        "place_001",
        "place_002"
      ]);
      expect(markerBody.data[0]).not.toHaveProperty("navigation");
      expect(markerBody.data[0]).not.toHaveProperty("gallery_urls");
      expect(markerBody.data[0]).not.toHaveProperty("gallery_media");
      expect(markerBody.data[0]).not.toHaveProperty("external_gallery_media");
      expect(markerBody.data[0]).not.toHaveProperty("cover_source");
      expect(markerBody.data[0]).not.toHaveProperty("address_zh");

      const invalidSortResponse = await main({}, {
        eventID: "req_cloud_004_invalid_sort",
        httpContext: {
          url: "http://localhost/places?sort=latest",
          httpMethod: "GET"
        }
      } as any);
      const invalidSortBody = invalidSortResponse.body as any;

      expect(invalidSortResponse.statusCode).toBe(400);
      expect(invalidSortBody.error.code).toBe("VALIDATION_ERROR");

      const emptyTagResponse = await main({}, {
        eventID: "req_cloud_004_empty_tag",
        httpContext: {
          url: "http://localhost/places?tag=missing-tag",
          httpMethod: "GET"
        }
      } as any);
      const emptyTagBody = emptyTagResponse.body as any;

      expect(emptyTagResponse.statusCode).toBe(200);
      expect(emptyTagBody.data.items).toEqual([]);
      expect(emptyTagBody.data.total).toBe(0);
    } finally {
      delete process.env.API_PROVIDER;
    }
  });

  it("normalizes the /api prefix in the cloudbase compatibility handler", async () => {
    const health = await main({}, {
      eventID: "req_api_health",
      httpContext: {
        url: "http://localhost/api/health",
        httpMethod: "GET"
      }
    } as any);
    const healthBody = health.body as any;

    expect(health.statusCode).toBe(200);
    expect(healthBody.success).toBe(true);
    expect(healthBody.data).toEqual({ ok: true });
    expect(healthBody.requestId).toBe("req_api_health");

    const places = await main({}, {
      eventID: "req_api_places",
      httpContext: {
        url: "http://localhost/api/places?page=1&pageSize=1",
        httpMethod: "GET"
      }
    } as any);
    const placesBody = places.body as any;

    expect(places.statusCode).toBe(200);
    expect(placesBody.success).toBe(true);
    expect(placesBody.requestId).toBe("req_api_places");
    expect(placesBody.data.items).toHaveLength(1);
  });

  it("keeps places query semantics aligned between mock and cloudbase providers", async () => {
    const mockProvider = createMockProvider();
    const cloudbaseProvider = createCloudbaseProvider();

    const query = {
      communityId: "tongzilin",
      category: "public-service",
      tag: "service",
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
        (item) =>
          item.category_level_1 === "public-service" &&
          item.tag_ids.includes("service")
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

    expect(
      markers.some((item) => item.name_en === "Invalid Coordinate Place")
    ).toBe(false);
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

      const draftListResponse = await main({}, {
        eventID: "req_cloud_005_public_draft_list",
        httpContext: {
          url: "http://localhost/places?keyword=Cloud%20Function%20Draft%20Place",
          httpMethod: "GET"
        }
      } as any);
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

      const listResponse = await main({}, {
        eventID: "req_cloud_007",
        httpContext: {
          url: "http://localhost/admin/places",
          httpMethod: "GET",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      } as any);
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

      const detailResponse = await main({}, {
        eventID: "req_cloud_008",
        httpContext: {
          url: `http://localhost/places/${createBody.data._id}`,
          httpMethod: "GET"
        }
      } as any);
      const detailBody = detailResponse.body as any;

      expect(detailResponse.statusCode).toBe(200);
      expect(detailBody.data.category_level_1).toBe("transport");

      const markerResponse = await main({}, {
        eventID: "req_cloud_009",
        httpContext: {
          url: "http://localhost/places/map-markers",
          httpMethod: "GET"
        }
      } as any);
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

  it("handles admin place delete through cloudbase route variants", async () => {
    process.env.API_PROVIDER = "cloudbase";

    const createPlace = async (
      nameEn: string,
      eventID: string,
      url = "http://localhost/admin/places"
    ) => {
      const response = await main(
        {
          name_zh: nameEn,
          name_en: nameEn,
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.622, longitude: 104.069 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "删除测试",
          intro_en: "Delete test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        },
        {
          eventID,
          httpContext: {
            url,
            httpMethod: "POST",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        }
      );
      const body = response.body as {
        success: true;
        data: { _id: string; name_en: string; status: string };
      };

      expect(response.statusCode).toBe(201);
      expect(body.success).toBe(true);
      return body.data;
    };

    try {
      const firstPlace = await createPlace(
        "Cloud Delete Route Place",
        "req_cloud_delete_create_1"
      );

      const unauthorizedDelete = await main(
        {},
        {
          eventID: "req_cloud_delete_forbidden",
          httpContext: {
            url: `http://localhost/admin/places/${firstPlace._id}`,
            httpMethod: "DELETE",
            headers: {
              "x-mock-user-id": "user_002"
            }
          }
        }
      );
      const unauthorizedDeleteBody = unauthorizedDelete.body as {
        success: false;
        error: { code: string };
      };

      expect(unauthorizedDelete.statusCode).toBe(403);
      expect(unauthorizedDeleteBody.error.code).toBe("FORBIDDEN");

      const missingDelete = await main(
        {},
        {
          eventID: "req_cloud_delete_missing",
          httpContext: {
            url: "http://localhost/admin/places/place_missing_cloud_delete",
            httpMethod: "DELETE",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        }
      );
      const missingDeleteBody = missingDelete.body as {
        success: false;
        error: { code: string };
      };

      expect(missingDelete.statusCode).toBe(404);
      expect(missingDeleteBody.error.code).toBe("NOT_FOUND");

      const deleteResponse = await main(
        {},
        {
          eventID: "req_cloud_delete_1",
          httpContext: {
            url: `http://localhost/admin/places/${firstPlace._id}`,
            httpMethod: "DELETE",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        }
      );
      const deleteBody = deleteResponse.body as {
        success: true;
        data: { deleted_id: string };
      };

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteBody.data).toEqual({ deleted_id: firstPlace._id });

      const deletedDetail = await main(
        {},
        {
          eventID: "req_cloud_delete_detail_404",
          httpContext: {
            url: `http://localhost/places/${firstPlace._id}`,
            httpMethod: "GET"
          }
        }
      );

      expect(deletedDetail.statusCode).toBe(404);

      const secondPlace = await createPlace(
        "Cloud Delete Prefix Place",
        "req_cloud_delete_create_2",
        "http://localhost/api/admin/places"
      );
      const patchResponse = await main(
        {
          name_en: "Cloud Delete Prefix Place Edited"
        },
        {
          eventID: "req_cloud_delete_patch_prefix",
          httpContext: {
            url: `http://localhost/api/admin/places/${secondPlace._id}`,
            httpMethod: "PATCH",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        }
      );
      const patchBody = patchResponse.body as {
        success: true;
        data: { _id: string; name_en: string };
      };

      expect(patchResponse.statusCode).toBe(200);
      expect(patchBody.data).toMatchObject({
        _id: secondPlace._id,
        name_en: "Cloud Delete Prefix Place Edited"
      });

      const prefixedDelete = await main(
        {},
        {
          eventID: "req_cloud_delete_2_prefix",
          httpContext: {
            url: `http://localhost/api/admin/places/${secondPlace._id}`,
            httpMethod: "DELETE",
            headers: {
              "x-mock-user-id": "user_001"
            }
          }
        }
      );
      const prefixedDeleteBody = prefixedDelete.body as {
        success: true;
        data: { deleted_id: string };
      };

      expect(prefixedDelete.statusCode).toBe(200);
      expect(prefixedDeleteBody.data.deleted_id).toBe(secondPlace._id);
    } finally {
      delete process.env.API_PROVIDER;
    }
  });

  it("omits _id from live CloudBase create set payload", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const set = vi.fn(async (payload: Record<string, unknown>) => {
      void payload;
      return {
        updated: 0,
        upsertedId: "place_created",
        requestId: "req_live_set"
      };
    });
    const doc = vi.fn(() => ({ set }));
    const placesCollection = {
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({
          data: []
        }))
      })),
      doc
    };
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: () => placesCollection
      }),
      getTempFileURL: vi.fn()
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const created = await provider.places.create({
        name_zh: "实时创建地点",
        name_en: "Live Create Place",
        category_level_1: "community",
        category_level_2: "acceptance",
        tag_ids: ["acceptance"],
        address_zh: "成都",
        address_en: "Chengdu",
        location: { latitude: 30.615, longitude: 104.066 },
        business_hours_zh: "周一至周日",
        business_hours_en: "Every day",
        intro_zh: "写入测试",
        intro_en: "Create test",
        recommended_reason_zh: null,
        recommended_reason_en: null,
        is_recommended: false,
        recommended_rank: 0,
        gallery_file_ids: [],
        gallery_urls: [],
        tencent_map_poi_id: null,
        supports_navigation: true,
        supports_favorite: true,
        supports_share: true,
        status: "draft"
      });
      const setPayload = set.mock.calls[0]?.[0] as Record<string, unknown>;

      expect(doc).toHaveBeenCalledWith(created._id);
      expect(set).toHaveBeenCalledTimes(1);
      expect(setPayload).not.toHaveProperty("_id");
      expect(setPayload.name_en).toBe("Live Create Place");
      expect(created._id).toMatch(/^place_/);
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });

  it("updates and removes live CloudBase place documents without upserts", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const livePlace: Place = {
      ...createMockDataset().places[0],
      _id: "place_live_mutation",
      name_en: "Live Mutation Place",
      status: "published"
    };
    const livePlaces = [livePlace];
    const set = vi.fn();
    const update = vi.fn(async (payload: Partial<Place>) => {
      Object.assign(livePlace, payload);
      return {
        updated: 1,
        requestId: "req_live_update"
      };
    });
    const remove = vi.fn(async () => {
      livePlaces.splice(0, livePlaces.length);
      return {
        deleted: 1,
        requestId: "req_live_remove"
      };
    });
    const doc = vi.fn(() => ({ set, update, remove }));
    const placesCollection = {
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({
          data: livePlaces
        }))
      })),
      doc
    };
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: () => placesCollection
      }),
      getTempFileURL: vi.fn()
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const updated = await provider.places.update(livePlace._id, {
        name_en: "Live Mutation Place Edited",
        gallery_file_ids: [],
        recommended_reason_en: null
      });

      expect(updated).toMatchObject({
        _id: livePlace._id,
        community_id: "tongzilin",
        name_en: "Live Mutation Place Edited",
        gallery_file_ids: [],
        recommended_reason_en: null
      });
      expect(doc).toHaveBeenCalledWith(livePlace._id);
      expect(update).toHaveBeenCalledWith({
        name_en: "Live Mutation Place Edited",
        gallery_file_ids: [],
        recommended_reason_en: null
      });
      expect(set).not.toHaveBeenCalled();

      const invalidInput = {
        cover_url: "not-a-url"
      } as unknown as Partial<Place>;
      await expect(
        provider.places.update(livePlace._id, invalidInput)
      ).rejects.toThrow();
      expect(update).toHaveBeenCalledTimes(1);

      const deleted = await provider.places.delete(livePlace._id);

      expect(deleted).toEqual({ deleted_id: livePlace._id });
      expect(remove).toHaveBeenCalledTimes(1);
      expect(await provider.places.delete("place_live_missing")).toBeNull();
      expect(remove).toHaveBeenCalledTimes(1);
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });

  it("persists live CloudBase discover report cases and resolves them", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const dataset = createMockDataset();
    const livePost = {
      ...dataset.posts.find((post) => post._id === "post_003")!,
      image_file_ids: [],
      image_urls: []
    };
    const livePosts = [livePost];
    const liveComments = [...dataset.comments];
    const evidenceFileId =
      "cloud://test-env/private/reports/pending_report_post_003/evidence.jpg";
    const liveFileAssets = [
      {
        _id: "file_live_evidence",
        file_id: evidenceFileId,
        cloud_path: "private/reports/pending_report_post_003/evidence.jpg",
        visibility: "private",
        biz_type: "report_evidence",
        biz_id: "pending_report_post_003",
        uploaded_by: "user_002",
        status: "active"
      }
    ];
    const liveReportCases: Array<{ _id: string } & Record<string, unknown>> =
      [];
    const liveAuditRecords: Array<{ _id: string } & Record<string, unknown>> =
      [];
    const createCollection = <TItem extends { _id: string }>(
      items: TItem[]
    ) => ({
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({ data: items }))
      })),
      doc: vi.fn((id: string) => ({
        set: vi.fn(async (payload: Omit<TItem, "_id">) => {
          const existingIndex = items.findIndex((item) => item._id === id);
          const nextItem = { _id: id, ...payload } as TItem;
          if (existingIndex >= 0) {
            items[existingIndex] = nextItem;
          } else {
            items.push(nextItem);
          }
          return { requestId: `req_set_${id}` };
        }),
        update: vi.fn(async (payload: Partial<TItem>) => {
          const existing = items.find((item) => item._id === id);
          if (existing) {
            Object.assign(existing, payload);
            return { updated: 1 };
          }
          return { updated: 0 };
        })
      }))
    });
    const collections = {
      posts: createCollection(livePosts),
      comments: createCollection(liveComments),
      file_assets: createCollection(liveFileAssets),
      discover_report_cases: createCollection(liveReportCases),
      discover_audit_records: createCollection(liveAuditRecords)
    };
    const emptyCollection = createCollection([]);
    const getTempFileURL = vi.fn(async (input: { fileList: string[] }) => ({
      fileList: input.fileList.map((fileID) => ({
        code: "SUCCESS",
        fileID,
        tempFileURL: `https://cdn.example.com/${encodeURIComponent(fileID)}`
      })),
      requestId: "req_report_temp_url"
    }));
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: (name: string) =>
          collections[name as keyof typeof collections] ?? emptyCollection
      }),
      getTempFileURL
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const reportedPost = await provider.posts.report(
        livePost._id,
        {
          reason: "safety",
          description: "Photo evidence attached.",
          evidence_file_ids: [evidenceFileId]
        },
        "user_002"
      );

      expect(reportedPost?.review_status).toBe("reported");
      expect(livePosts[0].review_status).toBe("reported");
      expect(liveReportCases).toHaveLength(1);
      expect(liveReportCases[0]).toMatchObject({
        target_type: "post",
        target_id: livePost._id,
        post_id: livePost._id,
        reporter_user_id: "user_002",
        status: "open",
        evidence_file_ids: [evidenceFileId]
      });
      expect(liveFileAssets[0].biz_id).toBe(liveReportCases[0]._id);

      const listed = await provider.posts.listReportCases(
        { status: "open", page: 1, pageSize: 20 },
        "user_001"
      );
      const reportId = String(liveReportCases[0]._id);
      expect(listed.items).toHaveLength(1);
      expect(listed.items[0].evidence[0]?.temp_url).toContain(
        encodeURIComponent(evidenceFileId)
      );
      expect(getTempFileURL).toHaveBeenCalledWith({
        fileList: [evidenceFileId]
      });

      const detail = await provider.posts.detailReportCase(
        reportId,
        "user_001"
      );
      expect(detail?._id).toBe(reportId);
      expect(detail?.evidence[0]?.cloud_path).toBe(
        "private/reports/pending_report_post_003/evidence.jpg"
      );

      const resolved = await provider.posts.resolveReportCase(
        reportId,
        {
          status: "actioned",
          reason: "Post hidden after review.",
          moderation_action: "hide"
        },
        "user_001"
      );

      expect(resolved?.status).toBe("actioned");
      expect(resolved?.handler_user_id).toBe("user_001");
      expect(livePosts[0]).toMatchObject({
        status: "hidden",
        review_status: "hidden"
      });
      expect(liveAuditRecords).toHaveLength(1);
      expect(liveAuditRecords[0]).toMatchObject({
        action: "resolve_report",
        target_type: "report",
        target_id: reportId,
        actor_user_id: "user_001"
      });
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });

  it("uses live CloudBase collections for admin discover governance", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const dataset = createMockDataset();
    const livePost = {
      ...dataset.posts.find((post) => post._id === "post_002")!,
      image_file_ids: [],
      image_urls: []
    };
    const liveComment = {
      ...dataset.comments.find((comment) => comment._id === "comment_001")!,
      post_id: livePost._id
    };
    const livePosts = [livePost];
    const liveComments = [liveComment];
    const liveReportCases: Array<{ _id: string } & Record<string, unknown>> =
      [];
    const liveAuditRecords: Array<{ _id: string } & Record<string, unknown>> =
      [];
    const createCollection = <TItem extends { _id: string }>(
      items: TItem[]
    ) => ({
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({ data: items }))
      })),
      doc: vi.fn((id: string) => ({
        set: vi.fn(async (payload: Omit<TItem, "_id">) => {
          const existingIndex = items.findIndex((item) => item._id === id);
          const nextItem = { _id: id, ...payload } as TItem;
          if (existingIndex >= 0) {
            items[existingIndex] = nextItem;
          } else {
            items.unshift(nextItem);
          }
          return { requestId: `req_set_${id}` };
        }),
        update: vi.fn(async (payload: Partial<TItem>) => {
          const existing = items.find((item) => item._id === id);
          if (existing) {
            Object.assign(existing, payload);
            return { updated: 1 };
          }
          return { updated: 0 };
        })
      }))
    });
    const collections = {
      posts: createCollection(livePosts),
      comments: createCollection(liveComments),
      file_assets: createCollection([]),
      discover_report_cases: createCollection(liveReportCases),
      discover_audit_records: createCollection(liveAuditRecords)
    };
    const emptyCollection = createCollection([]);
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: (name: string) =>
          collections[name as keyof typeof collections] ?? emptyCollection
      }),
      getTempFileURL: vi.fn(async (input: { fileList: string[] }) => ({
        fileList: input.fileList.map((fileID) => ({
          code: "SUCCESS",
          fileID,
          tempFileURL: `https://cdn.example.com/${encodeURIComponent(fileID)}`
        }))
      }))
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const adminPosts = await provider.posts.listAdmin(
        { page: 1, pageSize: 20, status: "all" },
        "user_001"
      );
      const adminComments = await provider.posts.listAdminComments(
        { page: 1, pageSize: 20, status: "all" },
        "user_001"
      );

      expect(adminPosts.items.map((post) => post._id)).toEqual([livePost._id]);
      expect(adminComments.items.map((comment) => comment._id)).toEqual([
        liveComment._id
      ]);

      const moderatedComment = await provider.posts.moderateComment(
        liveComment._id,
        {
          status: "hidden",
          reason: "Live comment moderation"
        },
        "user_001"
      );

      expect(moderatedComment?.status).toBe("hidden");
      expect(liveComments[0].status).toBe("hidden");
      expect(liveAuditRecords).toHaveLength(1);
      expect(liveAuditRecords[0]).toMatchObject({
        action: "moderate_comment",
        target_type: "comment",
        target_id: liveComment._id,
        actor_user_id: "user_001"
      });

      const enforced = await provider.posts.enforceUser(
        "user_002",
        {
          status: "muted",
          reason: "Repeated comment issues"
        },
        "user_001"
      );

      expect(enforced?.enforcement.status).toBe("muted");
      expect(liveAuditRecords).toHaveLength(2);
      expect(liveAuditRecords[0]).toMatchObject({
        action: "enforce_user",
        target_type: "user",
        target_id: "user_002"
      });
      await expect(
        provider.posts.create(
          {
            title: "Blocked live post",
            content: "Muted users cannot publish.",
            language: "en",
            tag_ids: []
          },
          "user_002"
        )
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        details: {
          enforcement_status: "muted",
          action: "create_post"
        }
      });
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });

  it("resolves live CloudBase event covers from place gallery file ids", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const placeGalleryFileId =
      "cloud://test-env/public/places/place_live_001/gallery-cover.jpg";
    const tempCoverUrl = `https://cdn.example.com/${encodeURIComponent(placeGalleryFileId)}`;
    const liveEvent = {
      ...createMockDataset().events[0],
      _id: "event_place_gallery_cover_001",
      cover_file_id: placeGalleryFileId,
      cover_cloud_path: "public/places/place_live_001/gallery-cover.jpg",
      cover_url: "https://stale.example.com/event-cover.jpg",
      review_status: "approved" as const,
      publish_status: "published" as const
    };
    const getTempFileURL = vi.fn(async (input: { fileList: string[] }) => ({
      fileList: input.fileList.map((fileID) => ({
        code: "SUCCESS",
        fileID,
        tempFileURL: `https://cdn.example.com/${encodeURIComponent(fileID)}`
      })),
      requestId: "req_event_cover_temp_url"
    }));
    const eventsCollection = {
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({
          data: [liveEvent]
        }))
      }))
    };
    const emptyCollection = {
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({
          data: []
        }))
      }))
    };
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: (name: string) =>
          name === "events" ? eventsCollection : emptyCollection
      }),
      getTempFileURL
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const detail = await provider.events.detail(liveEvent._id);

      expect(getTempFileURL).toHaveBeenCalledWith({
        fileList: [placeGalleryFileId]
      });
      expect(detail?.cover_url).toBe(tempCoverUrl);
      expect(detail?.cover_file_id).toBe(placeGalleryFileId);
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });

  it("resolves live CloudBase gallery file ids into detail media", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnvId = process.env.CLOUDBASE_ENV_ID;
    const liveGalleryFileId =
      "cloud://test-env.public/public/places/place_live_001/1.jpg";
    const livePlace = {
      ...createMockDataset().places[0],
      _id: "place_live_001",
      name_zh: "实时图集地点",
      name_en: "Live Gallery Place",
      gallery_file_ids: [liveGalleryFileId],
      gallery_urls: [],
      status: "published" as const
    };
    const getTempFileURL = vi.fn(async (input: { fileList: string[] }) => ({
      fileList: input.fileList.map((fileID) => ({
        code: "SUCCESS",
        fileID,
        tempFileURL: `https://cdn.example.com/${encodeURIComponent(fileID)}`
      })),
      requestId: "req_live_temp_url"
    }));
    const placesCollection = {
      limit: vi.fn(() => ({
        get: vi.fn(async () => ({
          data: [livePlace]
        }))
      }))
    };
    const initCloudbase = vi.fn(() => ({
      database: () => ({
        collection: () => placesCollection
      }),
      getTempFileURL
    }));

    try {
      vi.resetModules();
      vi.doMock("@cloudbase/node-sdk", () => ({
        default: {
          init: initCloudbase
        }
      }));
      process.env.CLOUDBASE_PROVIDER_MODE = "live";
      process.env.CLOUDBASE_ENV_ID = "test-env";

      const { createCloudbaseProvider: createLiveProvider } =
        await import("../src/providers/cloudbase");
      const provider = createLiveProvider();
      const detail = await provider.places.detail(livePlace._id);

      expect(initCloudbase).toHaveBeenCalledWith({ env: "test-env" });
      expect(getTempFileURL).toHaveBeenCalledWith({
        fileList: [liveGalleryFileId]
      });
      expect(detail?.gallery_media).toEqual([
        {
          file_id: liveGalleryFileId,
          cloud_path: "public/places/place_live_001/1.jpg",
          url: `https://cdn.example.com/${encodeURIComponent(liveGalleryFileId)}`,
          alt_zh: "实时图集地点 图集 1",
          alt_en: "Live Gallery Place gallery 1"
        }
      ]);
      expect(detail?.gallery_urls).toEqual([
        `https://cdn.example.com/${encodeURIComponent(liveGalleryFileId)}`
      ]);
    } finally {
      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }

      if (previousEnvId === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnvId;
      }

      vi.doUnmock("@cloudbase/node-sdk");
      vi.resetModules();
    }
  });
});
