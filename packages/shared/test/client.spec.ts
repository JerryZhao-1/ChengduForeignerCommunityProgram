import {
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

describe("shared api clients", () => {
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
    expect(httpResult.data[0]).toHaveProperty("category_level_1");
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
    expect(mockResult.data.gallery_media[0].url).toContain("images.unsplash.com");
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
      page: 2,
      pageSize: 5,
      recommended: true,
      sort: "recommended",
      keyword: "community"
    });

    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places?category=public-service&page=2&pageSize=5&recommended=true&sort=recommended&keyword=community",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });
});
