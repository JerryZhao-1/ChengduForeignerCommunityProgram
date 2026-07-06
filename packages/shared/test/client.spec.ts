import {
  ApiClientError,
  createFetchRequester,
  createHttpClient,
  createMockClient,
  apiPaths,
  type HttpRequester
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

describe("shared api clients", () => {
  it("throws typed client errors for API failure envelopes", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permission.",
              details: { role: "community_admin" }
            },
            requestId: "req_forbidden"
          }),
          {
            status: 403,
            headers: { "content-type": "application/json" }
          }
        )
    ) as unknown as typeof fetch;
    const requester = createFetchRequester(fetchImpl);

    await expect(
      requester("GET", "http://localhost/admin/places")
    ).rejects.toMatchObject({
      name: "ApiClientError",
      code: "FORBIDDEN",
      message: "Insufficient permission.",
      details: { role: "community_admin" },
      requestId: "req_forbidden",
      status: 403
    });
  });

  it("throws typed client errors for non-envelope HTTP failures", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Proxy failed" }), {
          status: 502,
          headers: { "content-type": "application/json" }
        })
    ) as unknown as typeof fetch;
    const requester = createFetchRequester(fetchImpl);

    await expect(
      requester("GET", "http://localhost/upstream")
    ).rejects.toBeInstanceOf(ApiClientError);
    await expect(
      requester("GET", "http://localhost/upstream")
    ).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      status: 502
    });
  });

  it("keeps mock and http client signatures aligned for events list", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_001",
      data: {
        items: [
          {
            _id: "event_http_001",
            community_id: "tongzilin",
            title_zh: "HTTP 活动",
            title_en: "HTTP Event",
            summary_zh: "简介",
            summary_en: "Summary",
            content_zh: "正文",
            content_en: "Body",
            cover_file_id: "cloud://cover",
            cover_cloud_path: "public/events/event_http_001/cover.jpg",
            cover_url: "https://example.com/cover.jpg",
            place_id: "place_001",
            address_text: "Address",
            location: { latitude: 30.6, longitude: 104.0 },
            start_time: "2026-03-28T10:00:00+08:00",
            end_time: "2026-03-28T12:00:00+08:00",
            signup_deadline: "2026-03-27T18:00:00+08:00",
            capacity: 20,
            organizer_user_id: "user_001",
            review_status: "approved",
            publish_status: "published"
          }
        ],
        page: 1,
        pageSize: 10,
        total: 1
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.events.list();
    const httpResult = await httpClient.events.list();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(Array.isArray(mockResult.data.items)).toBe(true);
    expect(Array.isArray(httpResult.data.items)).toBe(true);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/events",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for admin event management", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async (_method: string, url: string) => {
      if (String(url).endsWith("/registrations")) {
        return {
          success: true,
          requestId: "req_admin_event_registrations",
          data: [
            {
              _id: "reg_http_001",
              event_id: "event_http_001",
              user_id: "user_001",
              contact_name: "Jerry",
              contact_phone: "13800000000",
              attendee_count: 2,
              registration_status: "confirmed",
              ticket_id: "ticket_http_001",
              source_channel: "miniapp",
              ticket_code: "TZL-HTTP-001",
              ticket_status: "valid",
              ticket_used_at: null
            }
          ]
        };
      }

      return {
        success: true,
        requestId: "req_admin_events",
        data: {
          items: [
            {
              _id: "event_http_001",
              community_id: "tongzilin",
              title_zh: "HTTP 后台活动",
              title_en: "HTTP Admin Event",
              summary_zh: "简介",
              summary_en: "Summary",
              content_zh: "正文",
              content_en: "Body",
              cover_file_id: "cloud://cover",
              cover_cloud_path: "public/events/event_http_001/cover.jpg",
              cover_url: "https://example.com/admin-event.jpg",
              address_text: "Address",
              location: { latitude: 30.6, longitude: 104.0 },
              start_time: "2027-03-28T10:00:00+08:00",
              end_time: "2027-03-28T12:00:00+08:00",
              signup_deadline: "2027-03-27T18:00:00+08:00",
              capacity: 20,
              organizer_user_id: "user_001",
              review_status: "draft",
              publish_status: "draft",
              active_registration_count: 0,
              confirmed_attendee_count: 0,
              remaining_capacity: 20,
              is_full: false
            }
          ],
          page: 1,
          pageSize: 10,
          total: 1
        }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockEvents = await mockClient.admin.listEvents();
    const httpEvents = await httpClient.admin.listEvents();
    const mockRegistrations =
      await mockClient.admin.listEventRegistrations("event_001");
    const httpRegistrations =
      await httpClient.admin.listEventRegistrations("event_http_001");

    expect(mockEvents.success).toBe(true);
    expect(mockEvents.data.items.map((event) => event._id)).toContain(
      "event_draft"
    );
    expect(mockEvents.data.items[0]).toHaveProperty(
      "active_registration_count"
    );
    expect(httpEvents.data.items[0].remaining_capacity).toBe(20);
    expect(mockRegistrations.data[0]).toHaveProperty("ticket_code");
    expect(httpRegistrations.data[0].ticket_status).toBe("valid");
    expect(apiPaths.admin.listEvents).toBe("/admin/events");
    expect(apiPaths.admin.eventRegistrations("event_http_001")).toBe(
      "/admin/events/event_http_001/registrations"
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/events",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/events/event_http_001/registrations",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for place markers", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_002",
      data: [
        {
          _id: "place_http_001",
          name_zh: "社区中心",
          name_en: "Community Center",
          cover_url: "https://example.com/place-http-cover.jpg",
          category_level_1: "public-service",
          is_recommended: true,
          location: { latitude: 30.615, longitude: 104.0625 }
        }
      ]
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.places.mapMarkers();
    const httpResult = await httpClient.places.mapMarkers();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(mockResult.data[0]).toHaveProperty("category_level_1");
    expect(mockResult.data[0]).toHaveProperty("cover_url");
    expect(httpResult.data[0]).toHaveProperty("category_level_1");
    expect(httpResult.data[0]).toHaveProperty(
      "cover_url",
      "https://example.com/place-http-cover.jpg"
    );
    expect(httpResult.data[0]).toHaveProperty("is_recommended");
    expect(httpResult.data[0]).not.toHaveProperty("address_zh");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places/map-markers",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for place detail", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_004",
      data: {
        _id: "place_http_001",
        community_id: "tongzilin",
        name_zh: "社区中心",
        name_en: "Community Center",
        cover_url: "https://example.com/place.jpg",
        category_level_1: "public-service",
        category_level_2: "community-center",
        tag_ids: ["service"],
        address_zh: "成都",
        address_en: "Chengdu",
        location: { latitude: 30.615, longitude: 104.0625 },
        business_hours_zh: "周一至周日",
        business_hours_en: "Every day",
        intro_zh: "简介",
        intro_en: "Intro",
        gallery_media: [
          {
            file_id: "cloud://place-http-001-1",
            cloud_path: "public/places/place_http_001/1.jpg",
            url: "https://example.com/gallery.jpg",
            alt_zh: "社区中心 图集 1",
            alt_en: "Community Center gallery 1"
          }
        ],
        gallery_urls: ["https://example.com/gallery.jpg"],
        is_recommended: true,
        recommended_reason_zh: "推荐理由",
        recommended_reason_en: "Reason",
        supports_navigation: true,
        supports_favorite: true,
        supports_share: true,
        navigation: {
          latitude: 30.615,
          longitude: 104.0625,
          name_zh: "社区中心",
          name_en: "Community Center",
          address_zh: "成都",
          address_en: "Chengdu"
        },
        share: {
          title_zh: "社区中心",
          title_en: "Community Center",
          summary_zh: "简介",
          summary_en: "Intro"
        }
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.places.detail("place_001");
    const httpResult = await httpClient.places.detail("place_http_001");

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(mockResult.data).toHaveProperty("navigation");
    expect(mockResult.data).toHaveProperty("gallery_media");
    expect(mockResult.data.gallery_media[0].url).toContain(
      "images.unsplash.com"
    );
    expect(mockResult.data.gallery_urls).toEqual(
      mockResult.data.gallery_media.map((media) => media.url)
    );
    expect(httpResult.data).toHaveProperty("gallery_media");
    expect(httpResult.data).toHaveProperty("gallery_urls");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places/place_http_001",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes place list query for recommended filtering", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_003",
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.places.list({
      category: "public-service",
      tag: "service",
      page: 2,
      pageSize: 5,
      recommended: true,
      sort: "recommended",
      keyword: "community"
    });

    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places?category=public-service&tag=service&page=2&pageSize=5&recommended=true&sort=recommended&keyword=community",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for admin place delete", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_delete_place",
      data: {
        deleted_id: "place_http_001"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.deletePlace("place_003");
    const httpResult = await httpClient.admin.deletePlace("place_http_001");

    expect(apiPaths.admin.deletePlace("place_http_001")).toBe(
      "/admin/places/place_http_001"
    );
    expect(mockResult.success).toBe(true);
    expect(mockResult.data.deleted_id).toBe("place_003");
    expect(httpResult.success).toBe(true);
    expect(httpResult.data.deleted_id).toBe("place_http_001");
    expect(requester).toHaveBeenCalledWith(
      "DELETE",
      "http://localhost:8787/admin/places/place_http_001",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes admin place POI search through shared client", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_poi_search",
      data: [
        {
          id: "poi_http_001",
          title: "桐梓林",
          address: "四川省成都市武侯区桐梓林路",
          category: "交通设施",
          location: {
            latitude: 30.615,
            longitude: 104.062
          },
          province: "四川省",
          city: "成都市",
          district: "武侯区"
        }
      ]
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.searchPlacePoi({
      keyword: "桐梓林"
    });
    const httpResult = await httpClient.admin.searchPlacePoi({
      keyword: "桐梓林"
    });

    expect(mockResult.data[0].title).toBe("桐梓林");
    expect(httpResult.data[0].id).toBe("poi_http_001");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/places/poi-search?keyword=%E6%A1%90%E6%A2%93%E6%9E%97",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes admin Amap media search through shared client", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_amap_media_search",
      data: []
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.searchPlaceAmapMedia({
      keyword: "桐梓林"
    });
    const httpResult = await httpClient.admin.searchPlaceAmapMedia({
      keyword: "桐梓林",
      city: "成都"
    });

    expect(mockResult.success).toBe(true);
    expect(mockResult.data[0].image_candidates[0].source).toBe("amap");
    expect(httpResult.success).toBe(true);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/places/amap-media-search?keyword=%E6%A1%90%E6%A2%93%E6%9E%97&city=%E6%88%90%E9%83%BD",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends direct admin place gallery uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_gallery_upload",
      data: {
        file_asset: {
          _id: "file_001",
          file_id: "cloud://public/places/place_001/1.jpg",
          cloud_path: "public/places/place_001/1.jpg",
          visibility: "public",
          biz_type: "place_gallery",
          biz_id: "place_001",
          uploaded_by: "user_001",
          status: "active"
        },
        gallery_file_ids: ["cloud://public/places/place_001/1.jpg"]
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPlaceGalleryFile("place_001", {
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "entrance.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/places/place_001/gallery-files",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends direct admin event cover uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_event_cover_upload",
      data: {
        file_asset: {
          _id: "file_event_cover_001",
          file_id: "cloud://public/events/event_001/cover.jpg",
          cloud_path: "public/events/event_001/cover.jpg",
          visibility: "public",
          biz_type: "event_cover",
          biz_id: "event_001",
          uploaded_by: "user_001",
          status: "active"
        },
        cover_file_id: "cloud://public/events/event_001/cover.jpg",
        cover_cloud_path: "public/events/event_001/cover.jpg",
        cover_url: "https://example.com/public/events/event_001/cover.jpg"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadEventCoverFile("event_001", {
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "cover.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/events/event_001/cover-file",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends pending admin event cover uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_pending_event_cover_upload",
      data: {
        file_asset: {
          _id: "file_pending_event_cover_001",
          file_id: "cloud://public/events/_pending/pending_001/cover.jpg",
          cloud_path: "public/events/_pending/pending_001/cover.jpg",
          visibility: "public",
          biz_type: "event_cover",
          biz_id: "__pending_event_cover__",
          uploaded_by: "user_001",
          status: "active"
        },
        cover_file_id: "cloud://public/events/_pending/pending_001/cover.jpg",
        cover_cloud_path: "public/events/_pending/pending_001/cover.jpg",
        cover_url:
          "https://example.com/public/events/_pending/pending_001/cover.jpg"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPendingEventCoverFile({
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "cover.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/events/cover-file",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends pending admin place gallery uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_pending_gallery_upload",
      data: {
        file_asset: {
          _id: "file_pending_001",
          file_id: "cloud://public/places/_pending/pending_001/1.jpg",
          cloud_path: "public/places/_pending/pending_001/1.jpg",
          visibility: "public",
          biz_type: "place_gallery",
          biz_id: "__pending_place_gallery__",
          uploaded_by: "user_001",
          status: "active"
        },
        gallery_file_ids: ["cloud://public/places/_pending/pending_001/1.jpg"]
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPendingPlaceGalleryFile({
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "entrance.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/places/gallery-files",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });
});
