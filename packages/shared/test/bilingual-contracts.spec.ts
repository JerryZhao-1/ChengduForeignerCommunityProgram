import { describe, expect, it } from "vitest";

import {
  AuthPreferencesSchema,
  CreateEventInputSchema,
  CreatePlaceInputSchema,
  EventSchema,
  NotificationSchema,
  PlaceListItemSchema,
  PlaceMapMarkerSchema,
  UpdateAuthPreferencesInputSchema,
  authContracts,
  isPublicationPlaceholder,
  normalizeEventBilingualAddress,
  normalizeNotificationLocalization,
  validateEventPublicationReadiness,
  validatePlacePublicationReadiness
} from "../src";

const eventDraft = {
  title_zh: "社区活动",
  title_en: "",
  summary_zh: "简介",
  summary_en: "Summary",
  content_zh: "正文",
  content_en: "Body",
  address_text: "桐梓林社区中心",
  address_zh: "桐梓林社区中心",
  address_en: "",
  location: { latitude: 30.61, longitude: 104.06 },
  start_time: "2030-04-10T10:00:00+08:00",
  end_time: "2030-04-10T12:00:00+08:00",
  signup_deadline: "2030-04-09T18:00:00+08:00",
  capacity: 30
};

const placeDraft = {
  name_zh: "社区中心",
  name_en: "Community Center",
  cover_file_id: null,
  cover_url: null,
  cover_source: null,
  category_level_1: "community" as const,
  category_level_2: "community-center",
  tag_ids: [],
  address_zh: "桐梓林",
  address_en: "Tongzilin",
  location: { latitude: 30.61, longitude: 104.06 },
  business_hours_zh: "每天",
  business_hours_en: "Every day",
  intro_zh: "社区服务",
  intro_en: "Community services",
  recommended_reason_zh: null,
  recommended_reason_en: null,
  is_recommended: false,
  recommended_rank: 0,
  gallery_file_ids: [],
  external_gallery_media: [],
  gallery_urls: [],
  tencent_map_poi_id: null,
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true,
  status: "draft" as const,
  import_review: null
};

describe("bilingual migration-compatible contracts", () => {
  it("accepts and deterministically normalizes legacy Event addresses", () => {
    const parsed = EventSchema.parse({
      _id: "event_legacy",
      community_id: "tongzilin",
      ...eventDraft,
      address_zh: undefined,
      address_en: undefined,
      cover_file_id: null,
      cover_cloud_path: null,
      cover_url: "https://example.com/event.jpg",
      organizer_user_id: "user_001",
      review_status: "draft",
      publish_status: "draft"
    });
    const normalized = normalizeEventBilingualAddress(parsed);

    expect(normalized.address_zh).toBe("桐梓林社区中心");
    expect(normalized.address_en).toBe("");
    expect(normalized.address_text).toBe("桐梓林社区中心");
  });

  it("keeps the legacy Event address aligned with the canonical Chinese value", () => {
    expect(
      normalizeEventBilingualAddress({
        address_text: "旧地址",
        address_zh: "新中文地址",
        address_en: "New English address"
      })
    ).toMatchObject({
      address_text: "新中文地址",
      address_zh: "新中文地址",
      address_en: "New English address"
    });
  });

  it("accepts canonical bilingual Event writes and retains legacy address compatibility", () => {
    const parsed = CreateEventInputSchema.parse({
      ...eventDraft,
      title_en: "Draft Event",
      address_en: "Tongzilin Community Center"
    });
    expect(parsed).toMatchObject({
      address_text: "桐梓林社区中心",
      address_zh: "桐梓林社区中心",
      address_en: "Tongzilin Community Center"
    });
  });

  it("parses legacy and bilingual notifications without changing ownership fields", () => {
    const legacy = NotificationSchema.parse({
      _id: "notification_legacy",
      user_id: "user_001",
      title: "系统通知",
      body: "你有一条新消息",
      status: "unread",
      created_at: "2030-01-01T00:00:00.000Z"
    });
    const bilingual = NotificationSchema.parse({
      ...legacy,
      _id: "notification_bilingual",
      title_zh: "系统通知",
      title_en: "System Notification",
      body_zh: "你有一条新消息",
      body_en: "You have a new message"
    });

    expect(normalizeNotificationLocalization(legacy)).toMatchObject({
      user_id: "user_001",
      title: "系统通知",
      title_en: null
    });
    expect(bilingual.title_en).toBe("System Notification");
    expect(bilingual.body_en).toBe("You have a new message");
  });

  it("restricts preference reads and updates to supported locales", () => {
    expect(AuthPreferencesSchema.parse({ preferred_language: "en" })).toEqual({
      preferred_language: "en"
    });
    expect(
      UpdateAuthPreferencesInputSchema.safeParse({ preferred_language: "fr" })
        .success
    ).toBe(false);
    expect(authContracts.preferences.path).toBe("/auth/preferences");
    expect(authContracts.updatePreferences.method).toBe("PATCH");
  });
});

describe("publication readiness is separate from draft parsing", () => {
  it("allows incomplete Event drafts but reports exact public field paths", () => {
    expect(CreateEventInputSchema.safeParse(eventDraft).success).toBe(true);
    expect(validateEventPublicationReadiness(eventDraft)).toEqual({
      ready: false,
      issues: [
        {
          field: "title_en",
          code: "required",
          message: "title_en is required for publication."
        },
        {
          field: "address_en",
          code: "required",
          message: "address_en is required for publication."
        },
        {
          field: "cover_file_id",
          code: "managed_cover_required",
          message: "A CloudBase-managed event cover is required for publication."
        }
      ]
    });
  });

  it("rejects whitespace and documented placeholders but accepts complete Events", () => {
    expect(
      validateEventPublicationReadiness({
        ...eventDraft,
        title_en: "  TBD  ",
        address_en: "   "
      }).issues
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "title_en", code: "placeholder" }),
        expect.objectContaining({ field: "address_en", code: "required" })
      ])
    );
    expect(
      validateEventPublicationReadiness({
        ...eventDraft,
        title_en: "Published Event",
        address_en: "Tongzilin Community Center",
        cover_file_id: "cloud://managed-event-cover",
        cover_cloud_path: "public/events/event_001/cover.jpg"
      })
    ).toEqual({ ready: true, issues: [] });
    expect(
      validateEventPublicationReadiness({
        ...eventDraft,
        title_zh: "新活动草稿",
        title_en: "New Draft Event",
        summary_zh: "待补充简介",
        summary_en: "Summary pending",
        content_zh: "待补充正文",
        content_en: "Content pending",
        address_en: "Address pending"
      }).issues.map((issue) => issue.field)
    ).toEqual([
      "title_zh",
      "title_en",
      "summary_zh",
      "summary_en",
      "content_zh",
      "content_en",
      "address_en",
      "cover_file_id"
    ]);
  });

  it("does not treat ordinary words containing placeholder fragments as placeholders", () => {
    expect(
      isPublicationPlaceholder("Opening hours vary depending on holidays.")
    ).toBe(false);
    expect(isPublicationPlaceholder("Serving draft beer and snacks.")).toBe(
      false
    );
    expect(isPublicationPlaceholder("Summary pending")).toBe(true);
    expect(isPublicationPlaceholder("New Draft Place")).toBe(true);
  });

  it("conditionally requires both recommendation reasons for public Places", () => {
    expect(CreatePlaceInputSchema.safeParse(placeDraft).success).toBe(true);
    expect(validatePlacePublicationReadiness(placeDraft)).toEqual({
      ready: true,
      issues: []
    });
    const recommended = {
      ...placeDraft,
      status: "published" as const,
      is_recommended: true,
      recommended_reason_zh: "适合新居民",
      recommended_reason_en: "placeholder"
    };
    expect(validatePlacePublicationReadiness(recommended).issues).toEqual([
      expect.objectContaining({
        field: "recommended_reason_en",
        code: "placeholder"
      })
    ]);
  });

  it("does not broaden public Place list or marker schemas", () => {
    const source = {
      _id: "place_001",
      name_zh: "社区中心",
      name_en: "Community Center",
      cover_url: null,
      category_level_1: "community",
      category_level_2: "community-center",
      short_address_zh: "桐梓林",
      short_address_en: "Tongzilin",
      summary_zh: "简介",
      summary_en: "Intro",
      tag_ids: [],
      is_recommended: false,
      recommended_reason_zh: null,
      recommended_reason_en: null,
      supports_navigation: true,
      location: { latitude: 30.61, longitude: 104.06 },
      intro_en: "detail-only",
      gallery_urls: ["https://example.com/private-detail.jpg"]
    };

    expect(Object.keys(PlaceListItemSchema.parse(source))).not.toContain(
      "gallery_urls"
    );
    expect(Object.keys(PlaceMapMarkerSchema.parse(source))).toEqual([
      "_id",
      "name_zh",
      "name_en",
      "cover_url",
      "category_level_1",
      "is_recommended",
      "location"
    ]);
  });
});
