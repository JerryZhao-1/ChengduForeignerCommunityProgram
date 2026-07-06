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
