import {
  API_ERROR_CODES,
  apiPaths,
  CreateApiSuccessSchema,
  CommentListQuerySchema,
  CommentSchema,
  CreatePostInputSchema,
  DeleteEventResponseSchema,
  DeletePlaceResponseSchema,
  discoverContracts,
  DiscoverAuditRecordSchema,
  DiscoverAnalyticsQuerySchema,
  DiscoverAnalyticsSchema,
  DiscoverPostOpsInputSchema,
  DiscoverTagSchema,
  DiscoverMeGovernanceSchema,
  DiscoverReportCaseSchema,
  DiscoverUserGovernanceSummarySchema,
  DirectEventCoverUploadResponseSchema,
  EventAdminListItemSchema,
  EventAdminRegistrationRowSchema,
  EventSchema,
  EVENT_REGISTRATION_STATUSES,
  FILE_PATH_RULES,
  FileAssetSchema,
  LocaleSchema,
  PageResultSchema,
  PLACE_SECONDARY_CATEGORY_OPTIONS,
  PLACE_TOP_LEVEL_CATEGORIES,
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
  CreateEventInputSchema,
  eventContracts,
  fileContracts,
  MyPostListQuerySchema,
  NotificationSchema,
  PostInteractionStateSchema,
  ProfileFollowStateSchema,
  PublicProfileSchema,
  RelatedPostListQuerySchema,
  RecordPostShareInputSchema,
  ResolveReportInputSchema,
  placeContracts,
  PostSchema,
  SetProfileFollowInputSchema,
  SetPostFavoriteInputSchema,
  SetPostLikeInputSchema,
  UpsertDiscoverTagInputSchema,
  UpdatePlaceInputSchema,
  UserSchema
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

describe("shared contracts", () => {
  it("exposes fixed place secondary category options without enum-locking stored values", () => {
    expect(Object.keys(PLACE_SECONDARY_CATEGORY_OPTIONS).sort()).toEqual(
      [...PLACE_TOP_LEVEL_CATEGORIES].sort()
    );
    expect(PLACE_SECONDARY_CATEGORY_OPTIONS["public-service"]).toEqual(
      expect.arrayContaining(["community-center", "service-desk"])
    );
    expect(PLACE_SECONDARY_CATEGORY_OPTIONS["food-drink"]).toContain("cafe");
    expect(PLACE_SECONDARY_CATEGORY_OPTIONS["health-wellness"]).toContain(
      "clinic"
    );
    expect(PLACE_SECONDARY_CATEGORY_OPTIONS.transport).toContain(
      "metro-station"
    );
    expect(
      PlaceSchema.shape.category_level_2.safeParse("legacy-free-text").success
    ).toBe(true);
  });

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
    const deleteEnvelope = CreateApiSuccessSchema(
      DeleteEventResponseSchema
    ).parse({
      success: true,
      requestId: "req_delete_event",
      data: {
        deleted_id: "event_admin_001"
      }
    });
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
    expect(eventContracts.adminDelete).toMatchObject({
      method: "DELETE",
      path: "/admin/events/:id"
    });
    expect(apiPaths.admin.listEvents).toBe("/admin/events");
    expect(apiPaths.admin.deleteEvent("event_admin_001")).toBe(
      "/admin/events/event_admin_001"
    );
    expect(apiPaths.admin.eventRegistrations("event_admin_001")).toBe(
      "/admin/events/event_admin_001/registrations"
    );
    expect(deleteEnvelope.data.deleted_id).toBe("event_admin_001");
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

  it("accepts URL-only event cover fields", () => {
    const createInput = CreateEventInputSchema.parse({
      title_zh: "外链封面活动",
      title_en: "External Cover Event",
      summary_zh: "简介",
      summary_en: "Summary",
      content_zh: "正文",
      content_en: "Body",
      address_text: "成都市武侯区桐梓林国际社区",
      location: { latitude: 30.618887, longitude: 104.065468 },
      start_time: "2027-04-10T10:00:00+08:00",
      end_time: "2027-04-10T12:00:00+08:00",
      signup_deadline: "2027-04-09T18:00:00+08:00",
      capacity: 30,
      cover_file_id: null,
      cover_cloud_path: null,
      cover_url: "https://store.is.autonavi.com/showpic/event-cover.jpg"
    });
    const event = EventSchema.parse({
      _id: "event_url_cover_001",
      community_id: "tongzilin",
      ...createInput,
      organizer_user_id: "user_001",
      review_status: "draft",
      publish_status: "draft"
    });

    expect(createInput.cover_file_id).toBeNull();
    expect(event.cover_cloud_path).toBeNull();
    expect(event.cover_url).toContain("store.is.autonavi.com");
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

  it("normalizes direct event cover upload contracts", () => {
    const response = DirectEventCoverUploadResponseSchema.parse({
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
    });

    expect(response.file_asset.biz_type).toBe("event_cover");
    expect(fileContracts.directEventCoverUpload).toMatchObject({
      method: "POST",
      path: "/admin/events/:id/cover-file"
    });
    expect(fileContracts.directPendingEventCoverUpload).toMatchObject({
      method: "POST",
      path: "/admin/events/cover-file"
    });
    expect(apiPaths.admin.uploadPendingEventCoverFile).toBe(
      "/admin/events/cover-file"
    );
    expect(apiPaths.admin.uploadEventCoverFile("event_001")).toBe(
      "/admin/events/event_001/cover-file"
    );
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

  it("accepts discover core post metadata and comment read queries", () => {
    const post = PostSchema.parse({
      _id: "post_001",
      author_user_id: "user_001",
      author_display: {
        nickname: "Jerry",
        avatar_url: "https://example.com/avatar.jpg"
      },
      community_id: "tongzilin",
      title: "Local tip",
      content: "Useful content",
      language: "en",
      tag_ids: ["help"],
      location_text: null,
      image_file_ids: ["cloud://public/posts/pending/1.jpg"],
      image_urls: ["https://example.com/public/posts/pending/1.jpg"],
      place_id: null,
      event_id: "event_001",
      comment_count: 1,
      like_count: 0,
      favorite_count: 0,
      share_count: 0,
      created_at: "2026-03-28T09:00:00+08:00",
      updated_at: "2026-03-28T09:00:00+08:00",
      status: "visible",
      review_status: "visible"
    });
    const comment = CommentSchema.parse({
      _id: "comment_001",
      post_id: post._id,
      author_user_id: "user_002",
      author_display: {
        nickname: "Emma",
        avatar_url: null
      },
      content: "Thanks",
      language: "en",
      status: "visible",
      created_at: "2026-03-28T09:30:00+08:00"
    });
    const createInput = CreatePostInputSchema.parse({
      title: "Coffee tip",
      content: "Attach this to a place.",
      language: "en",
      tag_ids: ["coffee"],
      place_id: "place_002",
      event_id: null
    });
    const relatedQuery = RelatedPostListQuerySchema.parse({
      pageSize: "8",
      communityId: "tongzilin"
    });
    const notification = NotificationSchema.parse({
      _id: "notification_001",
      user_id: "user_001",
      title: "Comment",
      body: "A neighbor commented.",
      target_type: "comment",
      post_id: post._id,
      comment_id: comment._id,
      place_id: post.place_id,
      event_id: post.event_id,
      report_id: null,
      status: "unread",
      created_at: "2026-03-28T09:31:00+08:00"
    });
    const interaction = PostInteractionStateSchema.parse({
      post_id: post._id,
      actor_user_id: "user_001",
      liked: true,
      favorited: false,
      like_count: 1,
      favorite_count: 0,
      share_count: 3
    });
    const likeInput = SetPostLikeInputSchema.parse({ liked: false });
    const favoriteInput = SetPostFavoriteInputSchema.parse({
      favorited: true
    });
    const shareInput = RecordPostShareInputSchema.parse({
      channel: "copy_link"
    });
    const profile = PublicProfileSchema.parse({
      user: {
        _id: "user_002",
        nickname: "Emma",
        avatar_url: "https://example.com/emma.jpg",
        preferred_language: "en",
        status: "active"
      },
      stats: {
        post_count: 1,
        video_post_count: 0,
        follower_count: 2,
        following_count: 3
      },
      followed_by_actor: true,
      is_self: false,
      posts: [post],
      video_posts: []
    });
    const followInput = SetProfileFollowInputSchema.parse({
      following: true
    });
    const followState = ProfileFollowStateSchema.parse({
      follower_user_id: "user_001",
      followed_user_id: "user_002",
      following: true,
      follower_count: 2,
      following_count: 3
    });
    const opsInput = DiscoverPostOpsInputSchema.parse({
      is_featured: true,
      is_recommended: true,
      ops_rank: 10,
      reason: "Homepage curation"
    });
    const tag = DiscoverTagSchema.parse({
      _id: "coffee",
      label_zh: "咖啡",
      label_en: "Coffee",
      status: "active",
      post_count: 3,
      created_at: "2026-03-28T09:00:00+08:00",
      updated_at: "2026-03-28T09:00:00+08:00"
    });
    const tagInput = UpsertDiscoverTagInputSchema.parse({
      label_zh: "咖啡",
      label_en: "Coffee"
    });
    const analyticsQuery = DiscoverAnalyticsQuerySchema.parse({
      windowDays: "14"
    });
    const analytics = DiscoverAnalyticsSchema.parse({
      window_days: 14,
      post_count: 2,
      comment_count: 1,
      report_count: 1,
      open_report_count: 1,
      pending_workload_count: 2,
      average_moderation_hours: null,
      engagement: {
        like_count: 3,
        favorite_count: 2,
        share_count: 1
      },
      active_authors: [
        {
          user_id: "user_001",
          post_count: 2,
          comment_count: 1
        }
      ],
      popular_places: [{ place_id: "place_001", post_count: 1 }],
      popular_events: [{ event_id: "event_001", post_count: 1 }]
    });

    expect(post.comment_count).toBe(1);
    expect(createInput.place_id).toBe("place_002");
    expect(relatedQuery.pageSize).toBe(8);
    expect(interaction.liked).toBe(true);
    expect(likeInput.liked).toBe(false);
    expect(favoriteInput.favorited).toBe(true);
    expect(shareInput.channel).toBe("copy_link");
    expect(RecordPostShareInputSchema.parse({}).channel).toBe("other");
    expect(profile.user.nickname).toBe("Emma");
    expect(followInput.following).toBe(true);
    expect(followState.follower_count).toBe(2);
    expect(opsInput.ops_rank).toBe(10);
    expect(tag.status).toBe("active");
    expect(tagInput.status).toBe("active");
    expect(analyticsQuery.windowDays).toBe(14);
    expect(analytics.pending_workload_count).toBe(2);
    expect(discoverContracts.postInteraction).toMatchObject({
      method: "GET",
      path: "/discover/posts/:id/interaction"
    });
    expect(discoverContracts.setPostLike).toMatchObject({
      method: "POST",
      path: "/discover/posts/:id/like"
    });
    expect(discoverContracts.setPostFavorite).toMatchObject({
      method: "POST",
      path: "/discover/posts/:id/favorite"
    });
    expect(discoverContracts.recordPostShare).toMatchObject({
      method: "POST",
      path: "/discover/posts/:id/share"
    });
    expect(discoverContracts.profile).toMatchObject({
      method: "GET",
      path: "/discover/profiles/:userId"
    });
    expect(discoverContracts.setProfileFollow).toMatchObject({
      method: "POST",
      path: "/discover/profiles/:userId/follow"
    });
    expect(discoverContracts.listProfileFollowers).toMatchObject({
      method: "GET",
      path: "/discover/profiles/:userId/followers"
    });
    expect(discoverContracts.listProfileFollowing).toMatchObject({
      method: "GET",
      path: "/discover/profiles/:userId/following"
    });
    expect(discoverContracts.listPublicTags).toMatchObject({
      method: "GET",
      path: "/discover/tags"
    });
    expect(discoverContracts.createTag).toMatchObject({
      method: "POST",
      path: "/discover/tags"
    });
    expect(discoverContracts.myComments).toMatchObject({
      method: "GET",
      path: "/discover/me/comments"
    });
    expect(discoverContracts.myReports).toMatchObject({
      method: "GET",
      path: "/discover/me/reports"
    });
    expect(discoverContracts.updatePostOps).toMatchObject({
      method: "POST",
      path: "/admin/discover/posts/:id/ops"
    });
    expect(discoverContracts.listTags).toMatchObject({
      method: "GET",
      path: "/admin/discover/tags"
    });
    expect(discoverContracts.upsertTag).toMatchObject({
      method: "POST",
      path: "/admin/discover/tags/:id"
    });
    expect(discoverContracts.analytics).toMatchObject({
      method: "GET",
      path: "/admin/discover/analytics"
    });
    expect(apiPaths.discover.postInteraction(post._id)).toBe(
      "/discover/posts/post_001/interaction"
    );
    expect(apiPaths.discover.likePost(post._id)).toBe(
      "/discover/posts/post_001/like"
    );
    expect(apiPaths.discover.favoritePost(post._id)).toBe(
      "/discover/posts/post_001/favorite"
    );
    expect(apiPaths.discover.sharePost(post._id)).toBe(
      "/discover/posts/post_001/share"
    );
    expect(apiPaths.discover.profile("user_002")).toBe(
      "/discover/profiles/user_002"
    );
    expect(apiPaths.discover.followProfile("user_002")).toBe(
      "/discover/profiles/user_002/follow"
    );
    expect(apiPaths.discover.profileFollowers("user_002")).toBe(
      "/discover/profiles/user_002/followers"
    );
    expect(apiPaths.discover.profileFollowing("user_002")).toBe(
      "/discover/profiles/user_002/following"
    );
    expect(apiPaths.discover.listTags).toBe("/discover/tags");
    expect(apiPaths.discover.myCommentDetail("comment_001")).toBe(
      "/discover/me/comments/comment_001"
    );
    expect(apiPaths.discover.myReportDetail("report_001")).toBe(
      "/discover/me/reports/report_001"
    );
    expect(apiPaths.admin.updateDiscoverPostOps("post_001")).toBe(
      "/admin/discover/posts/post_001/ops"
    );
    expect(apiPaths.admin.listDiscoverTags).toBe("/admin/discover/tags");
    expect(apiPaths.admin.upsertDiscoverTag("coffee")).toBe(
      "/admin/discover/tags/coffee"
    );
    expect(apiPaths.admin.discoverAnalytics).toBe(
      "/admin/discover/analytics"
    );
    expect(discoverContracts.listPlaceRelatedPosts).toMatchObject({
      method: "GET",
      path: "/discover/places/:placeId/posts"
    });
    expect(discoverContracts.listEventRelatedPosts).toMatchObject({
      method: "GET",
      path: "/discover/events/:eventId/posts"
    });
    expect(comment.status).toBe("visible");
    expect(comment.author_display.nickname).toBe("Emma");
    expect(notification.post_id).toBe(post._id);
    expect(CommentListQuerySchema.parse({ page: "2" }).page).toBe(2);
    expect(MyPostListQuerySchema.parse({}).communityId).toBe("tongzilin");
  });

  it("accepts discover governance reports, user summaries, and audit records", () => {
    const report = DiscoverReportCaseSchema.parse({
      _id: "report_001",
      community_id: "tongzilin",
      target_type: "comment",
      target_id: "comment_001",
      post_id: "post_001",
      comment_id: "comment_001",
      reporter_user_id: "user_002",
      reason: "spam",
      description: "Repeated ad content",
      evidence_file_ids: ["cloud://report-evidence-001"],
      evidence: [
        {
          file_id: "cloud://report-evidence-001",
          cloud_path: FILE_PATH_RULES.reports + "report_001/evidence.jpg",
          visibility: "private",
          temp_url: "https://example.com/temp/report-evidence-001"
        }
      ],
      status: "open",
      handler_user_id: null,
      resolution_note: null,
      created_at: "2026-04-03T09:15:00+08:00",
      updated_at: "2026-04-03T09:15:00+08:00",
      resolved_at: null
    });
    const user = UserSchema.parse({
      _id: "user_002",
      openid: "openid_002",
      nickname: "Emma",
      avatar_url: "https://example.com/avatar.jpg",
      preferred_language: "en",
      role_flags: ["user"],
      status: "active"
    });
    const summary = DiscoverUserGovernanceSummarySchema.parse({
      user,
      enforcement: {
        status: "warned",
        reason: "Report upheld",
        notes: null,
        expires_at: null,
        updated_at: "2026-04-03T09:20:00+08:00",
        updated_by: "user_001"
      },
      post_count: 2,
      comment_count: 1,
      report_count: 1,
      violation_count: 1
    });
    const meGovernance = DiscoverMeGovernanceSchema.parse({
      ...summary,
      liked_post_count: 3,
      favorited_post_count: 1,
      unread_notification_count: 2
    });
    const audit = DiscoverAuditRecordSchema.parse({
      _id: "audit_001",
      community_id: "tongzilin",
      actor_user_id: "user_001",
      action: "resolve_report",
      target_type: "report",
      target_id: report._id,
      reason: "Report upheld",
      previous_state: { status: "open" },
      next_state: { status: "actioned" },
      created_at: "2026-04-03T09:22:00+08:00"
    });

    expect(report.evidence[0]?.visibility).toBe("private");
    expect(summary.enforcement.status).toBe("warned");
    expect(meGovernance.unread_notification_count).toBe(2);
    expect(meGovernance.liked_post_count).toBe(3);
    expect(audit.target_type).toBe("report");
    expect(
      ResolveReportInputSchema.parse({ status: "actioned", reason: "ok" })
    ).toHaveProperty("moderation_action", "none");
  });
});
