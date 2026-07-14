import { CommunityPlanOfflineBundleSchema } from "../schemas/community-plans";

/**
 * The curated demo event ID used by the deterministic Community Plan engine.
 * The API injects this from server-side configuration; the offline bundle
 * ships the corresponding public-safe snapshot so the judge flow works
 * without network access.
 */
export const COMMUNITY_PLAN_DEMO_EVENT_ID = "event_001";

const placeProjection = {
  _id: "place_001",
  name_zh: "桐梓林社区中心",
  name_en: "Tongzilin Community Center",
  cover_url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
  category_level_1: "public-service",
  is_recommended: true,
  location: {
    latitude: 30.615,
    longitude: 104.0625
  }
};

const eventProjection = {
  _id: COMMUNITY_PLAN_DEMO_EVENT_ID,
  title_zh: "周末国际邻里早午餐",
  title_en: "Weekend Neighborhood Brunch",
  summary_zh: "面向桐梓林新老居民的轻社交活动。",
  summary_en: "A casual meet-up for old and new Tongzilin neighbors.",
  start_time: "2027-04-02T10:00:00+08:00",
  end_time: "2027-04-02T12:00:00+08:00",
  cover_url: "https://example.com/public/events/event_001/cover.jpg"
};

const canonicalBundle = {
  version: "1",
  plan: {
    plan_id: "offline_tongzilin_120",
    community_id: "tongzilin",
    generated_at: "2027-04-02T09:00:00+08:00",
    items: [
      {
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
        place: placeProjection
      },
      {
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
        event: eventProjection
      }
    ],
    total_duration_minutes: 120,
    route_kind: "place_event",
    generation_source: "rule_based",
    ai_status: "not_configured",
    generated_by: "tongzilin-rule-engine-v1"
  },
  markers: [placeProjection],
  places: [placeProjection],
  events: [eventProjection]
};

/**
 * Canonical validated offline bundle for the Tongzilin First 120 Minutes
 * Community Plan. Used by the mobile offline adapter in mock mode or when
 * transport/DNS/timeout/5xx failures occur. Never reports ai_enhanced.
 */
export const communityPlanOfflineBundle =
  CommunityPlanOfflineBundleSchema.parse(canonicalBundle);
