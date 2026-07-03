import {
  API_ERROR_CODES,
  apiPaths,
  CreateApiSuccessSchema,
  DeletePlaceResponseSchema,
  EventAdminListItemSchema,
  EventAdminRegistrationRowSchema,
  EVENT_REGISTRATION_STATUSES,
  FILE_PATH_RULES,
  FileAssetSchema,
  LocaleSchema,
  PageResultSchema,
  PlaceAmapImageCandidateSchema,
  PlaceAmapMediaSearchItemSchema,
  PlaceAmapMediaSearchQuerySchema,
  PlaceDetailSchema,
  PlaceExternalMediaSchema,
  PlaceListItemSchema,
  PlaceListQuerySchema,
  PlaceMapMarkerSchema,
  PlacePoiSearchItemSchema,
  PlacePoiSearchQuerySchema,
  PlaceSchema,
  eventContracts,
  placeContracts,
  PostSchema,
  UpdatePlaceInputSchema,
  UserSchema
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

describe("shared contracts", () => {
  it("accepts a valid bilingual place payload", () => {
    const place = PlaceSchema.parse({
      _id: "place_001",
      community_id: "tongzilin",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_file_id: null,
      cover_url: null,
      cover_source: null,
      category_level_1: "public-service",
      category_level_2: "community",
      tag_ids: ["service"],
      address_zh: "成都",
      address_en: "Chengdu",
      location: { latitude: 30.6, longitude: 104.0 },
      tencent_map_poi_id: null,
      business_hours_zh: "周一至周日",
      business_hours_en: "Every day",
      intro_zh: "简介",
      intro_en: "Intro",
      recommended_reason_zh: null,
      recommended_reason_en: null,
      is_recommended: false,
      recommended_rank: 0,
      gallery_file_ids: [],
      external_gallery_media: [],
      gallery_urls: [],
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      status: "published"
    });

    expect(place.name_en).toBe("Tongzilin Community Center");
  });

  it("accepts split list and detail place payloads", () => {
    const item = PlaceListItemSchema.parse({
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_url: "https://example.com/place.jpg",
      category_level_1: "public-service",
      category_level_2: "community-center",
      short_address_zh: "成都市武侯区",
      short_address_en: "Wuhou District, Chengdu",
      summary_zh: "简介",
      summary_en: "Summary",
      tag_ids: ["service"],
      is_recommended: true,
      recommended_reason_zh: "推荐理由",
      recommended_reason_en: "Reason",
      supports_navigation: true
    });
    const detail = PlaceDetailSchema.parse({
      _id: "place_001",
      community_id: "tongzilin",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_url: "https://example.com/place.jpg",
      cover_source: {
        source: "amap",
        source_place_id: "B001",
        image_url: "https://store.is.autonavi.com/showpic/place-cover.jpg",
        image_title: null,
        attribution: {
          label: "Image source: Amap",
          provider_name: "Amap"
        }
      },
      category_level_1: "public-service",
      category_level_2: "community-center",
      tag_ids: ["service"],
      address_zh: "成都",
      address_en: "Chengdu",
      location: { latitude: 30.6, longitude: 104.0 },
      business_hours_zh: "周一至周日",
      business_hours_en: "Every day",
      intro_zh: "简介",
      intro_en: "Intro",
      gallery_media: [
        {
          file_id: "cloud://place-001-1",
          cloud_path: "public/places/place_001/1.jpg",
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
          alt_zh: "桐梓林社区中心 图集 1",
          alt_en: "Tongzilin Community Center gallery 1"
        }
      ],
      external_gallery_media: [
        {
          source: "amap",
          source_place_id: "B001",
          image_url: "https://store.is.autonavi.com/showpic/place.jpg",
          image_title: "门头",
          attribution: {
            label: "Image source: Amap",
            provider_name: "Amap"
          }
        }
      ],
      gallery_urls: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156"
      ],
      is_recommended: true,
      recommended_reason_zh: "推荐理由",
      recommended_reason_en: "Reason",
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      navigation: {
        latitude: 30.6,
        longitude: 104.0,
        name_zh: "桐梓林社区中心",
        name_en: "Tongzilin Community Center",
        address_zh: "成都",
        address_en: "Chengdu"
      },
      share: {
        title_zh: "桐梓林社区中心",
        title_en: "Tongzilin Community Center",
        summary_zh: "简介",
        summary_en: "Intro"
      }
    });

    expect(item.short_address_en).toContain("Chengdu");
    expect(detail.navigation.latitude).toBe(30.6);
    expect(detail.cover_source?.source).toBe("amap");
    expect(detail.external_gallery_media[0].source_place_id).toBe("B001");
  });

  it("validates external place media source attribution", () => {
    const media = PlaceExternalMediaSchema.parse({
      source: "amap",
      source_place_id: "B001",
      image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
      image_title: "Amap storefront",
      attribution: {
        label: "Image source: Amap"
      }
    });
    const candidate = PlaceAmapImageCandidateSchema.parse(media);

    expect(candidate.attribution.provider_name).toBe("Amap");
    expect(() =>
      PlaceExternalMediaSchema.parse({
        ...media,
        source: "google"
      })
    ).toThrow();
  });

  it("accepts a place map marker payload", () => {
    const marker = PlaceMapMarkerSchema.parse({
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_url: null,
      category_level_1: "public-service",
      is_recommended: true,
      location: {
        latitude: 30.615,
        longitude: 104.0625
      }
    });

    expect(marker.category_level_1).toBe("public-service");
    expect(marker.cover_url).toBeNull();
  });

  it("normalizes the places list query contract", () => {
    const query = PlaceListQuerySchema.parse({
      page: "2",
      pageSize: "12",
      communityId: "tongzilin",
      keyword: "coffee",
      category: "cafe",
      tag: "english-friendly",
      recommended: "true",
      sort: "recommended"
    });

    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(12);
    expect(query.communityId).toBe("tongzilin");
    expect(query.keyword).toBe("coffee");
    expect(query.category).toBe("cafe");
    expect(query.tag).toBe("english-friendly");
    expect(query.recommended).toBe(true);
    expect(query.sort).toBe("recommended");

    const defaults = PlaceListQuerySchema.parse({});

    expect(defaults).toEqual({
      page: 1,
      pageSize: 10,
      communityId: "tongzilin",
      sort: "recommended"
    });
  });

  it("exposes admin place update and delete contracts through shared paths", () => {
    const deleteEnvelope = CreateApiSuccessSchema(
      DeletePlaceResponseSchema
    ).parse({
      success: true,
      requestId: "req_delete_place",
      data: {
        deleted_id: "place_001"
      }
    });

    expect(placeContracts.adminUpdate).toMatchObject({
      method: "PATCH",
      path: "/admin/places/:id"
    });
    expect(placeContracts.adminDelete).toMatchObject({
      method: "DELETE",
      path: "/admin/places/:id"
    });
    expect(apiPaths.admin.updatePlace("place_001")).toBe(
      "/admin/places/place_001"
    );
    expect(apiPaths.admin.deletePlace("place_001")).toBe(
      "/admin/places/place_001"
    );
    expect(deleteEnvelope.data.deleted_id).toBe("place_001");
  });

  it("exposes admin event list and registration contracts through shared paths", () => {
    const adminListEnvelope = CreateApiSuccessSchema(
      PageResultSchema(EventAdminListItemSchema)
    ).parse({
      success: true,
      requestId: "req_admin_events",
      data: {
        items: [
          {
            _id: "event_admin_001",
            community_id: "tongzilin",
            title_zh: "后台活动",
            title_en: "Admin Event",
            summary_zh: "简介",
            summary_en: "Summary",
            content_zh: "正文",
            content_en: "Body",
            cover_file_id: "cloud://cover",
            cover_cloud_path: "public/events/event_admin_001/cover.jpg",
            cover_url: "https://example.com/event-admin.jpg",
            address_text: "桐梓林",
            location: { latitude: 30.615, longitude: 104.062 },
            start_time: "2027-04-02T10:00:00+08:00",
            end_time: "2027-04-02T12:00:00+08:00",
            signup_deadline: "2027-04-01T18:00:00+08:00",
            capacity: 10,
            organizer_user_id: "user_001",
            review_status: "draft",
            publish_status: "draft",
            active_registration_count: 0,
            confirmed_attendee_count: 0,
            remaining_capacity: 10,
            is_full: false
          }
        ],
        page: 1,
        pageSize: 10,
        total: 1
      }
    });
    const registrationsEnvelope = CreateApiSuccessSchema(
      EventAdminRegistrationRowSchema.array()
    ).parse({
      success: true,
      requestId: "req_admin_event_registrations",
      data: [
        {
          _id: "reg_001",
          event_id: "event_admin_001",
          user_id: "user_001",
          contact_name: "Jerry",
          contact_phone: "13800000000",
          attendee_count: 2,
          registration_status: "confirmed",
          ticket_id: "ticket_001",
          source_channel: "miniapp",
          ticket_code: "TZL-001",
          ticket_status: "valid",
          ticket_used_at: null
        }
      ]
    });

    expect(eventContracts.adminList).toMatchObject({
      method: "GET",
      path: "/admin/events"
    });
    expect(eventContracts.adminRegistrations).toMatchObject({
      method: "GET",
      path: "/admin/events/:id/registrations"
    });
    expect(apiPaths.admin.listEvents).toBe("/admin/events");
    expect(apiPaths.admin.eventRegistrations("event_admin_001")).toBe(
      "/admin/events/event_admin_001/registrations"
    );
    expect(adminListEnvelope.data.items[0].remaining_capacity).toBe(10);
    expect(registrationsEnvelope.data[0].ticket_code).toBe("TZL-001");
    expect(
      EventAdminListItemSchema.safeParse({
        _id: "event_admin_001"
      }).success
    ).toBe(false);
    expect(
      EventAdminRegistrationRowSchema.safeParse({
        _id: "reg_001",
        event_id: "event_admin_001"
      }).success
    ).toBe(false);
  });

  it("normalizes admin place POI search contracts", () => {
    const query = PlacePoiSearchQuerySchema.parse({
      keyword: " 桐梓林 "
    });
    const item = PlacePoiSearchItemSchema.parse({
      id: "poi_001",
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
    });

    expect(query.keyword).toBe("桐梓林");
    expect(item.location.latitude).toBe(30.615);
    expect(placeContracts.adminPoiSearch).toMatchObject({
      method: "GET",
      path: "/admin/places/poi-search"
    });
    expect(apiPaths.admin.searchPlacePoi).toBe("/admin/places/poi-search");
    expect(() => PlacePoiSearchQuerySchema.parse({ keyword: "" })).toThrow();
    expect(() =>
      PlacePoiSearchItemSchema.parse({
        ...item,
        location: {
          latitude: 999,
          longitude: 104.062
        }
      })
    ).toThrow();
  });

  it("normalizes admin Amap media search contracts", () => {
    const query = PlaceAmapMediaSearchQuerySchema.parse({
      keyword: " 桐梓林 ",
      city: "成都"
    });
    const item = PlaceAmapMediaSearchItemSchema.parse({
      id: "B001",
      title: "桐梓林",
      address: "四川省成都市武侯区桐梓林路",
      category: "生活服务",
      location: {
        latitude: 30.615,
        longitude: 104.062
      },
      province: "四川省",
      city: "成都市",
      district: "武侯区",
      image_candidates: [
        {
          source: "amap",
          source_place_id: "B001",
          image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
          image_title: null,
          attribution: {
            label: "Image source: Amap",
            provider_name: "Amap"
          }
        }
      ]
    });

    expect(query.keyword).toBe("桐梓林");
    expect(item.image_candidates).toHaveLength(1);
    expect(placeContracts.adminAmapMediaSearch).toMatchObject({
      method: "GET",
      path: "/admin/places/amap-media-search"
    });
    expect(apiPaths.admin.searchPlaceAmapMedia).toBe(
      "/admin/places/amap-media-search"
    );
    expect(() =>
      PlaceAmapImageCandidateSchema.parse({
        ...item.image_candidates[0],
        source: "unsupported"
      })
    ).toThrow();
  });

  it("keeps admin place updates partial and rejects invalid editable fields", () => {
    const update = UpdatePlaceInputSchema.parse({
      name_en: "Edited Place",
      cover_url: null,
      cover_source: null,
      gallery_file_ids: [],
      external_gallery_media: [
        {
          source: "amap",
          source_place_id: "B001",
          image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
          image_title: null,
          attribution: {
            label: "Image source: Amap",
            provider_name: "Amap"
          }
        }
      ],
      recommended_reason_en: null
    });

    expect(update).toEqual({
      name_en: "Edited Place",
      cover_url: null,
      cover_source: null,
      gallery_file_ids: [],
      external_gallery_media: [
        {
          source: "amap",
          source_place_id: "B001",
          image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
          image_title: null,
          attribution: {
            label: "Image source: Amap",
            provider_name: "Amap"
          }
        }
      ],
      recommended_reason_en: null
    });
    expect(update).not.toHaveProperty("name_zh");
    expect(update).not.toHaveProperty("_id");
    expect(apiPaths.admin.updatePlace("place_001")).toBe(
      "/admin/places/place_001"
    );

    expect(() =>
      UpdatePlaceInputSchema.parse({
        category_level_1: "service"
      })
    ).toThrow();
    expect(() =>
      UpdatePlaceInputSchema.parse({
        status: "deleted"
      })
    ).toThrow();
    expect(() =>
      UpdatePlaceInputSchema.parse({
        cover_url: "not-a-url"
      })
    ).toThrow();
    expect(() =>
      UpdatePlaceInputSchema.parse({
        location: {
          latitude: "30.6",
          longitude: 104.0
        }
      })
    ).toThrow();
  });

  it("keeps places list items limited to card browsing fields", () => {
    const item = PlaceListItemSchema.parse({
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_url: "https://example.com/place.jpg",
      category_level_1: "public-service",
      category_level_2: "community-center",
      short_address_zh: "成都市武侯区",
      short_address_en: "Wuhou District, Chengdu",
      summary_zh: "简介",
      summary_en: "Summary",
      tag_ids: ["service"],
      is_recommended: true,
      recommended_reason_zh: "推荐理由",
      recommended_reason_en: "Reason",
      supports_navigation: true,
      cover_source: {
        source: "amap",
        source_place_id: "B001",
        image_url: "https://store.is.autonavi.com/showpic/B001-cover.jpg",
        image_title: null,
        attribution: {
          label: "Image source: Amap",
          provider_name: "Amap"
        }
      },
      gallery_urls: ["https://example.com/gallery.jpg"],
      external_gallery_media: [
        {
          source: "amap",
          source_place_id: "B001",
          image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
          image_title: null,
          attribution: {
            label: "Image source: Amap",
            provider_name: "Amap"
          }
        }
      ],
      gallery_media: [
        {
          file_id: "cloud://place-001-1",
          cloud_path: "public/places/place_001/1.jpg",
          url: "https://example.com/gallery.jpg",
          alt_zh: "图集",
          alt_en: "Gallery"
        }
      ],
      address_zh: "成都",
      navigation: {
        latitude: 30.6,
        longitude: 104.0,
        name_zh: "桐梓林社区中心",
        name_en: "Tongzilin Community Center",
        address_zh: "成都",
        address_en: "Chengdu"
      }
    });

    expect(Object.keys(item).sort()).toEqual([
      "_id",
      "category_level_1",
      "category_level_2",
      "cover_url",
      "is_recommended",
      "name_en",
      "name_zh",
      "recommended_reason_en",
      "recommended_reason_zh",
      "short_address_en",
      "short_address_zh",
      "summary_en",
      "summary_zh",
      "supports_navigation",
      "tag_ids"
    ]);
    expect(item).not.toHaveProperty("cover_source");
    expect(item).not.toHaveProperty("external_gallery_media");
    expect(item).not.toHaveProperty("gallery_urls");
    expect(item).not.toHaveProperty("gallery_media");
    expect(item).not.toHaveProperty("navigation");
    expect(item).not.toHaveProperty("address_zh");
  });

  it("rejects invalid places list sort values", () => {
    expect(() =>
      PlaceListQuerySchema.parse({
        sort: "latest"
      })
    ).toThrow();
  });

  it("rejects invalid locale fields", () => {
    expect(() =>
      UserSchema.parse({
        _id: "user_001",
        nickname: "Jerry",
        avatar_url: "https://example.com/avatar.jpg",
        preferred_language: "jp",
        role_flags: ["user"],
        status: "active"
      })
    ).toThrow();
  });

  it("keeps page envelope, file rules, and enums stable", () => {
    const successSchema = CreateApiSuccessSchema(PageResultSchema(PostSchema));
    const fileAsset = FileAssetSchema.parse({
      _id: "file_001",
      file_id: "cloud://id",
      cloud_path: "public/posts/post_001/1.jpg",
      visibility: "public",
      biz_type: "post_image",
      biz_id: "post_001",
      uploaded_by: "user_001",
      status: "active"
    });
    const parsed = successSchema.parse({
      success: true,
      requestId: "req_001",
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0
      }
    });

    expect(parsed.data.total).toBe(0);
    expect(fileAsset.cloud_path).toBe(
      FILE_PATH_RULES.postImages + "post_001/1.jpg"
    );
    expect({
      locales: LocaleSchema.options,
      eventRegistrationStatuses: EVENT_REGISTRATION_STATUSES,
      apiErrorCodes: API_ERROR_CODES,
      filePaths: FILE_PATH_RULES
    }).toMatchSnapshot();
  });
});
