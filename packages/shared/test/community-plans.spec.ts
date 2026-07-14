import {
  API_ERROR_CODES,
  COMMUNITY_PLAN_DEMO_EVENT_ID,
  CommunityPlanAIEnhancementItemSchema,
  CommunityPlanAIEnhancementSchema,
  CommunityPlanEventProjectionSchema,
  CommunityPlanOfflineBundleSchema,
  CommunityPlanPlaceProjectionSchema,
  CommunityPlanSchema,
  CommunityPlanUsageSchema,
  NewResidentPreferenceSchema,
  apiPaths,
  communityPlanContracts,
  createCommunityPlanAIEnhancementSchema
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

// --- Canonical building blocks reused across cases ---

const validPlaceProjection = {
  _id: "place_001",
  name_zh: "桐梓林社区中心",
  name_en: "Tongzilin Community Center",
  cover_url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
  category_level_1: "public-service",
  is_recommended: true,
  location: { latitude: 30.615, longitude: 104.0625 }
};

const validEventProjection = {
  _id: COMMUNITY_PLAN_DEMO_EVENT_ID,
  title_zh: "周末国际邻里早午餐",
  title_en: "Weekend Neighborhood Brunch",
  summary_zh: "面向桐梓林新老居民的轻社交活动。",
  summary_en: "A casual meet-up for old and new Tongzilin neighbors.",
  start_time: "2027-04-02T10:00:00+08:00",
  end_time: "2027-04-02T12:00:00+08:00",
  cover_url: "https://example.com/public/events/event_001/cover.jpg"
};

const basePlaceVisitItem = {
  item_id: "stop_place_001",
  ref_id: "place_001",
  ref_type: "place",
  type: "place_visit",
  start_offset_minutes: 0,
  duration_minutes: 60,
  title_zh: "桐梓林社区中心",
  title_en: "Tongzilin Community Center",
  summary_zh: "先到社区中心了解服务点和公告，获取在地生活指引。",
  summary_en:
    "Start at the community center to learn about services and announcements.",
  tips_zh: "前台可提供中英双语指引，建议询问最近的国际居民服务点。",
  tips_en:
    "The front desk offers bilingual guidance; ask about the nearest international resident services.",
  status: "pending",
  place: validPlaceProjection
};

const baseEventAttendItem = {
  item_id: "stop_event_001",
  ref_id: COMMUNITY_PLAN_DEMO_EVENT_ID,
  ref_type: "event",
  type: "event_attend",
  start_offset_minutes: 60,
  duration_minutes: 60,
  title_zh: "周末国际邻里早午餐",
  title_en: "Weekend Neighborhood Brunch",
  summary_zh: "参加邻里早午餐，和长期居民与新邻居轻松交流。",
  summary_en:
    "Join the neighborhood brunch and meet both long-term and new neighbors.",
  tips_zh: "现场有志愿者协助介绍，演示确认不创建报名或票券。",
  tips_en:
    "Volunteers will help with introductions. Demo Confirm creates no booking or ticket.",
  status: "pending",
  event: validEventProjection
};

const basePlan = {
  plan_id: "plan_test_001",
  community_id: "tongzilin",
  generated_at: "2027-04-02T09:00:00+08:00",
  items: [basePlaceVisitItem, baseEventAttendItem],
  total_duration_minutes: 120,
  route_kind: "place_event",
  generation_source: "rule_based",
  ai_status: "not_configured",
  generated_by: "tongzilin-rule-engine-v1"
};

describe("community plan preference input", () => {
  it("accepts a minimal valid guest preference", () => {
    const parsed = NewResidentPreferenceSchema.parse({
      preferred_language: "zh",
      interests: ["community-service", "social"],
      arrival_context: "first-week",
      household_type: "solo"
    });

    expect(parsed.accessibility_needs).toEqual([]);
    expect(parsed.preferred_language).toBe("zh");
  });

  it("defaults accessibility_needs to an empty array", () => {
    const parsed = NewResidentPreferenceSchema.parse({
      preferred_language: "en",
      interests: ["food-drink"],
      arrival_context: "settled",
      household_type: "couple"
    });
    expect(parsed.accessibility_needs).toEqual([]);
  });

  it("rejects empty interests", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: [],
        arrival_context: "first-week",
        household_type: "solo"
      }).success
    ).toBe(false);
  });

  it("rejects unknown interests", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["unknown-interest"],
        arrival_context: "first-week",
        household_type: "solo"
      }).success
    ).toBe(false);
  });

  it("rejects unsupported locale", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "fr",
        interests: ["social"],
        arrival_context: "first-week",
        household_type: "solo"
      }).success
    ).toBe(false);
  });

  it("rejects unknown arrival context and household type", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["social"],
        arrival_context: "first-year",
        household_type: "solo"
      }).success
    ).toBe(false);
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["social"],
        arrival_context: "first-week",
        household_type: "commune"
      }).success
    ).toBe(false);
  });

  it("rejects community_id attempts to leak tenant scoping into guest input", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["social"],
        arrival_context: "first-week",
        household_type: "solo",
        community_id: "tongzilin"
      }).success
    ).toBe(false);
  });

  it("rejects PII-style free text fields via strict mode", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["social"],
        arrival_context: "first-week",
        household_type: "solo",
        name: "Jerry",
        phone: "13800000000",
        openid: "openid_001",
        free_text_goal: "我想要更快的融入社区"
      }).success
    ).toBe(false);
  });

  it("rejects unknown accessibility need values", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["social"],
        arrival_context: "first-week",
        household_type: "solo",
        accessibility_needs: ["wheelchair", "unknown-need"]
      }).success
    ).toBe(false);
  });

  it("rejects duplicate multi-select values", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["food-drink", "food-drink"],
        arrival_context: "first-week",
        household_type: "solo",
        accessibility_needs: []
      }).success
    ).toBe(false);

    expect(
      NewResidentPreferenceSchema.safeParse({
        preferred_language: "zh",
        interests: ["food-drink"],
        arrival_context: "first-week",
        household_type: "solo",
        accessibility_needs: ["wheelchair", "wheelchair"]
      }).success
    ).toBe(false);
  });
});

describe("community plan public-safe projections", () => {
  it("keeps place projection to map-safe fields only", () => {
    const parsed =
      CommunityPlanPlaceProjectionSchema.parse(validPlaceProjection);

    expect(Object.keys(parsed).sort()).toEqual(
      [
        "_id",
        "category_level_1",
        "cover_url",
        "is_recommended",
        "location",
        "name_en",
        "name_zh"
      ].sort()
    );
    expect(parsed).not.toHaveProperty("address_zh");
    expect(parsed).not.toHaveProperty("address_en");
    expect(parsed).not.toHaveProperty("short_address_zh");
    expect(parsed).not.toHaveProperty("intro_zh");
    expect(parsed).not.toHaveProperty("business_hours_zh");
    expect(parsed).not.toHaveProperty("gallery_urls");
    expect(parsed).not.toHaveProperty("tencent_map_poi_id");
    expect(parsed).not.toHaveProperty("supports_navigation");
    expect(parsed).not.toHaveProperty("recommended_reason_zh");
    expect(parsed).not.toHaveProperty("recommended_rank");
    expect(parsed).not.toHaveProperty("tag_ids");
    expect(parsed).not.toHaveProperty("category_level_2");
    expect(parsed).not.toHaveProperty("status");
  });

  it("rejects place projection carrying forbidden detail/list fields", () => {
    const forbiddenFields = {
      address_zh: "桐梓林",
      address_en: "Tongzilin",
      short_address_zh: "桐梓林",
      short_address_en: "Tongzilin",
      intro_zh: "详情正文",
      intro_en: "Detail intro",
      business_hours_zh: "周一至周日",
      business_hours_en: "Every day",
      gallery_urls: ["https://example.com/gallery.jpg"],
      tencent_map_poi_id: "B001",
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      recommended_reason_zh: "理由",
      recommended_reason_en: "Reason",
      recommended_rank: 1,
      tag_ids: ["service"],
      category_level_2: "community-center",
      status: "published"
    };

    for (const [key, value] of Object.entries(forbiddenFields)) {
      expect(
        CommunityPlanPlaceProjectionSchema.safeParse({
          ...validPlaceProjection,
          [key]: value
        }).success
      ).toBe(false);
    }
  });

  it("keeps event projection to public-safe fields only", () => {
    const parsed =
      CommunityPlanEventProjectionSchema.parse(validEventProjection);

    expect(Object.keys(parsed).sort()).toEqual(
      [
        "_id",
        "cover_url",
        "end_time",
        "start_time",
        "summary_en",
        "summary_zh",
        "title_en",
        "title_zh"
      ].sort()
    );
    expect(parsed).not.toHaveProperty("content_zh");
    expect(parsed).not.toHaveProperty("address_text");
    expect(parsed).not.toHaveProperty("address_zh");
    expect(parsed).not.toHaveProperty("location");
    expect(parsed).not.toHaveProperty("place_id");
    expect(parsed).not.toHaveProperty("signup_deadline");
    expect(parsed).not.toHaveProperty("capacity");
    expect(parsed).not.toHaveProperty("organizer_user_id");
    expect(parsed).not.toHaveProperty("review_status");
    expect(parsed).not.toHaveProperty("publish_status");
    expect(parsed).not.toHaveProperty("cover_file_id");
  });

  it("rejects event projection carrying forbidden detail/admin fields", () => {
    const forbiddenFields = {
      content_zh: "活动正文",
      content_en: "Body",
      address_text: "桐梓林社区中心",
      address_zh: "桐梓林社区中心",
      address_en: "Tongzilin Community Center",
      location: { latitude: 30.615, longitude: 104.0625 },
      place_id: "place_001",
      signup_deadline: "2027-04-01T18:00:00+08:00",
      capacity: 30,
      organizer_user_id: "user_001",
      review_status: "approved",
      publish_status: "published",
      cover_file_id: "cloud://cover",
      cover_cloud_path: "public/events/event_001/cover.jpg"
    };

    for (const [key, value] of Object.entries(forbiddenFields)) {
      expect(
        CommunityPlanEventProjectionSchema.safeParse({
          ...validEventProjection,
          [key]: value
        }).success
      ).toBe(false);
    }
  });

  it("rejects invalid cover_url on place projection", () => {
    expect(
      CommunityPlanPlaceProjectionSchema.safeParse({
        ...validPlaceProjection,
        cover_url: "not-a-url"
      }).success
    ).toBe(false);
  });

  it("accepts null cover_url on place projection", () => {
    const parsed = CommunityPlanPlaceProjectionSchema.parse({
      ...validPlaceProjection,
      cover_url: null
    });
    expect(parsed.cover_url).toBeNull();
  });

  it("requires non-null cover_url on event projection", () => {
    expect(
      CommunityPlanEventProjectionSchema.safeParse({
        ...validEventProjection,
        cover_url: null
      }).success
    ).toBe(false);
  });

  it("rejects unsupported top-level category on place projection", () => {
    expect(
      CommunityPlanPlaceProjectionSchema.safeParse({
        ...validPlaceProjection,
        category_level_1: "service"
      }).success
    ).toBe(false);
  });

  it("rejects out-of-range place coordinates", () => {
    expect(
      CommunityPlanPlaceProjectionSchema.safeParse({
        ...validPlaceProjection,
        location: { latitude: 999, longitude: 104.0625 }
      }).success
    ).toBe(false);
    expect(
      CommunityPlanPlaceProjectionSchema.safeParse({
        ...validPlaceProjection,
        location: { latitude: 30.615, longitude: -999 }
      }).success
    ).toBe(false);
  });

  it("rejects invalid event timestamps", () => {
    expect(
      CommunityPlanEventProjectionSchema.safeParse({
        ...validEventProjection,
        start_time: "not-a-date"
      }).success
    ).toBe(false);
  });
});

describe("community plan discriminated items", () => {
  it("accepts canonical place_visit + event_attend pair", () => {
    const parsed = CommunityPlanSchema.parse(basePlan);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].type).toBe("place_visit");
    expect(parsed.items[1].type).toBe("event_attend");
  });

  it("rejects unsupported activity discriminator", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          {
            ...basePlaceVisitItem,
            type: "activity",
            ref_type: "activity"
          },
          baseEventAttendItem
        ]
      }).success
    ).toBe(false);
  });

  it("rejects place_visit item with ref_type=event", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, ref_type: "event" },
          baseEventAttendItem
        ]
      }).success
    ).toBe(false);
  });

  it("rejects event_attend item with ref_type=place", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          { ...baseEventAttendItem, ref_type: "place" }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects place_visit item missing place projection", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, place: undefined },
          baseEventAttendItem
        ]
      }).success
    ).toBe(false);
  });

  it("rejects event_attend item missing event projection", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          { ...baseEventAttendItem, event: undefined }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects plan with zero place_visit items", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          baseEventAttendItem,
          {
            ...baseEventAttendItem,
            item_id: "stop_event_002",
            ref_id: "event_002"
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects plan with two place_visit items", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          {
            ...basePlaceVisitItem,
            item_id: "stop_place_002",
            ref_id: "place_002"
          }
        ]
      }).success
    ).toBe(false);
  });
});

describe("community plan invariants", () => {
  it("rejects duplicate item_ids", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          { ...baseEventAttendItem, item_id: basePlaceVisitItem.item_id }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects duplicate ref_ids", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          { ...baseEventAttendItem, ref_id: basePlaceVisitItem.ref_id }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects ref_ids that do not match embedded projection IDs", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, ref_id: "place_other" },
          baseEventAttendItem
        ]
      }).success
    ).toBe(false);

    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          { ...baseEventAttendItem, ref_id: "event_other" }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects non-chronological ordering by start_offset_minutes", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...baseEventAttendItem, start_offset_minutes: 60 },
          { ...basePlaceVisitItem, start_offset_minutes: 0 }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects overlapping items", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          {
            ...basePlaceVisitItem,
            start_offset_minutes: 0,
            duration_minutes: 90
          },
          {
            ...baseEventAttendItem,
            start_offset_minutes: 60,
            duration_minutes: 60
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects item ending after minute 120", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, duration_minutes: 70 },
          {
            ...baseEventAttendItem,
            start_offset_minutes: 70,
            duration_minutes: 60
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects total_duration_minutes inconsistent with item sum", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        total_duration_minutes: 100
      }).success
    ).toBe(false);
  });

  it("rejects a plan shorter than 120 minutes even when durations match", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, duration_minutes: 50 },
          {
            ...baseEventAttendItem,
            start_offset_minutes: 50,
            duration_minutes: 50
          }
        ],
        total_duration_minutes: 100
      }).success
    ).toBe(false);
  });

  it("rejects route_kind=places_only", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        route_kind: "places_only",
        items: [basePlaceVisitItem, baseEventAttendItem]
      }).success
    ).toBe(false);
  });

  it("rejects route_kind=place_event with only place_visit items", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        route_kind: "place_event",
        items: [
          basePlaceVisitItem,
          {
            ...basePlaceVisitItem,
            item_id: "stop_place_002",
            ref_id: "place_002"
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects missing generated_by field", () => {
    const planWithoutGeneratedBy = { ...basePlan } as Partial<typeof basePlan>;
    delete planWithoutGeneratedBy.generated_by;
    expect(CommunityPlanSchema.safeParse(planWithoutGeneratedBy).success).toBe(
      false
    );
  });

  it("rejects empty generated_by string", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generated_by: ""
      }).success
    ).toBe(false);
  });

  it("rejects unknown route_kind", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        route_kind: "events_only"
      }).success
    ).toBe(false);
  });

  it("rejects a three-item plan", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlaceVisitItem, duration_minutes: 40 },
          {
            ...basePlaceVisitItem,
            item_id: "stop_place_002",
            ref_id: "place_002",
            start_offset_minutes: 40,
            duration_minutes: 40
          },
          {
            ...basePlaceVisitItem,
            item_id: "stop_place_003",
            ref_id: "place_004",
            start_offset_minutes: 80,
            duration_minutes: 40
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects non-tongzilin community_id", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        community_id: "jinjiang"
      }).success
    ).toBe(false);
  });

  it("rejects unknown generation_source", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "ai-only"
      }).success
    ).toBe(false);
  });

  it("rejects invalid generated_at timestamps", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generated_at: "not-a-date"
      }).success
    ).toBe(false);
  });

  it("rejects an event that does not cover its plan attendance window", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          basePlaceVisitItem,
          {
            ...baseEventAttendItem,
            event: {
              ...validEventProjection,
              start_time: "2027-04-03T10:00:00+08:00",
              end_time: "2027-04-03T12:00:00+08:00"
            }
          }
        ]
      }).success
    ).toBe(false);
  });

  it("rejects unknown ai_status", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        ai_status: "success"
      }).success
    ).toBe(false);
  });
});

describe("community plan AI usage semantics", () => {
  it("rejects usage when generation_source is rule_based", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "rule_based",
        ai_status: "not_configured",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      }).success
    ).toBe(false);
  });

  it("rejects ai_enhanced + ok without usage", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "ai_enhanced",
        ai_status: "ok",
        usage: undefined
      }).success
    ).toBe(false);
  });

  it("accepts ai_enhanced + ok with positive usage", () => {
    const parsed = CommunityPlanSchema.parse({
      ...basePlan,
      generation_source: "ai_enhanced",
      ai_status: "ok",
      usage: {
        prompt_tokens: 120,
        completion_tokens: 80,
        total_tokens: 200
      }
    });
    expect(parsed.usage?.total_tokens).toBe(200);
  });

  it("rejects usage with non-positive total_tokens", () => {
    expect(
      CommunityPlanUsageSchema.safeParse({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }).success
    ).toBe(false);
  });

  it("rejects ai_enhanced with a non-ok status", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "ai_enhanced",
        ai_status: "validation_failed"
      }).success
    ).toBe(false);
  });

  it("accepts rule_based_fallback without usage", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "rule_based_fallback",
        ai_status: "timeout"
      }).success
    ).toBe(true);
  });

  it("rejects rule_based with an AI success status", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "rule_based",
        ai_status: "ok"
      }).success
    ).toBe(false);
  });

  it("rejects rule_based_fallback with not_configured", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        generation_source: "rule_based_fallback",
        ai_status: "not_configured"
      }).success
    ).toBe(false);
  });
});

describe("community plan AI enhancement allowlist", () => {
  it("accepts well-formed enhancement items within length limits", () => {
    const parsed = CommunityPlanAIEnhancementSchema.parse({
      items: [
        {
          item_id: "stop_place_001",
          summary_zh: "更短摘要",
          summary_en: "Shorter summary",
          tips_zh: "更短提示",
          tips_en: "Shorter tip"
        },
        {
          item_id: "stop_event_001",
          summary_zh: "活动摘要",
          summary_en: "Event summary",
          tips_zh: "活动提示",
          tips_en: "Event tip"
        }
      ]
    });
    expect(parsed.items[0].item_id).toBe("stop_place_001");
  });

  it("rejects enhancement item with summary_zh exceeding 240 chars", () => {
    expect(
      CommunityPlanAIEnhancementItemSchema.safeParse({
        item_id: "stop_place_001",
        summary_zh: "字".repeat(241),
        summary_en: "Short",
        tips_zh: "提示",
        tips_en: "Tip"
      }).success
    ).toBe(false);
  });

  it("rejects enhancement item with tips_en exceeding 160 chars", () => {
    expect(
      CommunityPlanAIEnhancementItemSchema.safeParse({
        item_id: "stop_place_001",
        summary_zh: "摘要",
        summary_en: "Summary",
        tips_zh: "提示",
        tips_en: "x".repeat(161)
      }).success
    ).toBe(false);
  });

  it("rejects enhancement item with unknown extra fields", () => {
    expect(
      CommunityPlanAIEnhancementItemSchema.safeParse({
        item_id: "stop_place_001",
        summary_zh: "摘要",
        summary_en: "Summary",
        tips_zh: "提示",
        tips_en: "Tip",
        forbidden_field: "evil"
      }).success
    ).toBe(false);
  });

  it("rejects enhancement payload missing items array", () => {
    expect(CommunityPlanAIEnhancementSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty and duplicate AI item ID sets", () => {
    const narration = {
      item_id: "stop_place_001",
      summary_zh: "摘要",
      summary_en: "Summary",
      tips_zh: "提示",
      tips_en: "Tip"
    };

    expect(
      CommunityPlanAIEnhancementSchema.safeParse({ items: [] }).success
    ).toBe(false);
    expect(
      CommunityPlanAIEnhancementSchema.safeParse({
        items: [narration, narration]
      }).success
    ).toBe(false);
  });

  it("requires the AI item ID set to match the source plan exactly", () => {
    const schema = createCommunityPlanAIEnhancementSchema([
      "stop_place_001",
      "stop_event_001"
    ]);
    const narration = {
      summary_zh: "摘要",
      summary_en: "Summary",
      tips_zh: "提示",
      tips_en: "Tip"
    };

    expect(
      schema.safeParse({
        items: [
          { ...narration, item_id: "stop_place_001" },
          { ...narration, item_id: "stop_event_001" }
        ]
      }).success
    ).toBe(true);
    expect(
      schema.safeParse({
        items: [
          { ...narration, item_id: "stop_place_001" },
          { ...narration, item_id: "stop_extra_001" }
        ]
      }).success
    ).toBe(false);
  });
});

describe("community plan offline bundle", () => {
  it("accepts the canonical validated bundle shape", () => {
    const parsed = CommunityPlanOfflineBundleSchema.parse({
      version: "1",
      plan: basePlan,
      markers: [validPlaceProjection],
      places: [validPlaceProjection],
      events: [validEventProjection]
    });
    expect(parsed.plan.plan_id).toBe("plan_test_001");
    expect(parsed.markers).toHaveLength(1);
  });

  it("rejects bundle with detail/admin field leakage in places", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: basePlan,
        markers: [validPlaceProjection],
        places: [{ ...validPlaceProjection, address_zh: "桐梓林" }],
        events: [validEventProjection]
      }).success
    ).toBe(false);
  });

  it("rejects bundle with capacity leakage in events", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: basePlan,
        markers: [validPlaceProjection],
        places: [validPlaceProjection],
        events: [{ ...validEventProjection, capacity: 30 }]
      }).success
    ).toBe(false);
  });

  it("rejects bundle with unknown top-level field", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: basePlan,
        markers: [validPlaceProjection],
        places: [validPlaceProjection],
        events: [validEventProjection],
        secret_admin_payload: { foo: "bar" }
      }).success
    ).toBe(false);
  });

  it("rejects bundle with invalid inner plan", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: { ...basePlan, total_duration_minutes: 10 },
        markers: [validPlaceProjection],
        places: [validPlaceProjection],
        events: [validEventProjection]
      }).success
    ).toBe(false);
  });

  it("rejects bundle missing snapshots referenced by the plan", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: basePlan,
        markers: [],
        places: [],
        events: []
      }).success
    ).toBe(false);
  });

  it("rejects bundle snapshots that disagree with the plan projection", () => {
    expect(
      CommunityPlanOfflineBundleSchema.safeParse({
        version: "1",
        plan: basePlan,
        markers: [
          {
            ...validPlaceProjection,
            name_en: "Different marker title"
          }
        ],
        places: [validPlaceProjection],
        events: [validEventProjection]
      }).success
    ).toBe(false);
  });
});

describe("community plan contract surface", () => {
  it("exposes only POST /community-plan/generate and no detail GET", () => {
    expect(Object.keys(communityPlanContracts)).toEqual(["generate"]);
    expect(communityPlanContracts.generate.method).toBe("POST");
    expect(communityPlanContracts.generate.path).toBe(
      "/community-plan/generate"
    );
    expect(apiPaths.communityPlan.generate).toBe("/community-plan/generate");
    // No detail path is exposed on the shared apiPaths surface
    expect(apiPaths.communityPlan).not.toHaveProperty("detail");
    expect(apiPaths.communityPlan).not.toHaveProperty("get");
    expect(apiPaths.communityPlan).not.toHaveProperty("complete");
  });

  it("binds request and response schemas on the generate contract", () => {
    expect(communityPlanContracts.generate.request).toBe(
      NewResidentPreferenceSchema
    );
    expect(communityPlanContracts.generate.response).toBe(CommunityPlanSchema);
  });

  it("includes RATE_LIMITED in API_ERROR_CODES for guest limiter mapping", () => {
    expect(API_ERROR_CODES).toContain("RATE_LIMITED");
  });
});
