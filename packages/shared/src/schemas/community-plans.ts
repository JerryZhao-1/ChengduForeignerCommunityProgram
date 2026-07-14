import { z } from "zod";

import { LocaleSchema } from "./common";
import { PlaceTopLevelCategorySchema } from "./place-categories";

// --- Preference enums ---

export const COMMUNITY_PLAN_INTERESTS = [
  "community-service",
  "food-drink",
  "social",
  "language-exchange",
  "family-kids",
  "health-wellness",
  "transport",
  "outdoor-sports"
] as const;

export const CommunityPlanInterestSchema = z.enum(COMMUNITY_PLAN_INTERESTS);
export type CommunityPlanInterest = z.infer<typeof CommunityPlanInterestSchema>;

export const COMMUNITY_PLAN_ARRIVAL_CONTEXTS = [
  "first-week",
  "first-month",
  "settled"
] as const;

export const CommunityPlanArrivalContextSchema = z.enum(
  COMMUNITY_PLAN_ARRIVAL_CONTEXTS
);
export type CommunityPlanArrivalContext = z.infer<
  typeof CommunityPlanArrivalContextSchema
>;

export const COMMUNITY_PLAN_HOUSEHOLD_TYPES = [
  "solo",
  "couple",
  "family-with-kids",
  "shared"
] as const;

export const CommunityPlanHouseholdTypeSchema = z.enum(
  COMMUNITY_PLAN_HOUSEHOLD_TYPES
);
export type CommunityPlanHouseholdType = z.infer<
  typeof CommunityPlanHouseholdTypeSchema
>;

export const COMMUNITY_PLAN_ACCESSIBILITY_NEEDS = [
  "wheelchair",
  "low-vision",
  "low-mobility",
  "hearing-support",
  "quiet-environment"
] as const;

export const CommunityPlanAccessibilityNeedSchema = z.enum(
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS
);

// --- Strict guest preference request (no community_id, no PII, no free text) ---

export const NewResidentPreferenceSchema = z
  .object({
    preferred_language: LocaleSchema,
    interests: z.array(CommunityPlanInterestSchema).min(1),
    arrival_context: CommunityPlanArrivalContextSchema,
    household_type: CommunityPlanHouseholdTypeSchema,
    accessibility_needs: z
      .array(CommunityPlanAccessibilityNeedSchema)
      .default([])
  })
  .strict();

// --- Public-safe projections (explicit allowlists) ---

export const CommunityPlanPlaceProjectionSchema = z
  .object({
    _id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    cover_url: z.string().url().nullable(),
    category_level_1: PlaceTopLevelCategorySchema,
    is_recommended: z.boolean(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    })
  })
  .strict();

export const CommunityPlanEventProjectionSchema = z
  .object({
    _id: z.string(),
    title_zh: z.string(),
    title_en: z.string(),
    summary_zh: z.string(),
    summary_en: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    cover_url: z.string().url()
  })
  .strict();

// --- Plan item discriminated union ---

export const COMMUNITY_PLAN_GENERATION_SOURCES = [
  "rule_based",
  "ai_enhanced",
  "rule_based_fallback"
] as const;

export const CommunityPlanGenerationSourceSchema = z.enum(
  COMMUNITY_PLAN_GENERATION_SOURCES
);

export const COMMUNITY_PLAN_AI_STATUSES = [
  "ok",
  "not_configured",
  "timeout",
  "validation_failed",
  "upstream_error",
  "unavailable"
] as const;

export const CommunityPlanAiStatusSchema = z.enum(COMMUNITY_PLAN_AI_STATUSES);

export const CommunityPlanItemStatusSchema = z.literal("pending");

const communityPlanItemBaseFields = {
  item_id: z.string(),
  ref_id: z.string(),
  start_offset_minutes: z.number().int().min(0),
  duration_minutes: z.number().int().positive(),
  title_zh: z.string(),
  title_en: z.string(),
  summary_zh: z.string(),
  summary_en: z.string(),
  tips_zh: z.string(),
  tips_en: z.string(),
  status: CommunityPlanItemStatusSchema
};

export const CommunityPlanPlaceVisitItemSchema = z
  .object({
    ...communityPlanItemBaseFields,
    ref_type: z.literal("place"),
    type: z.literal("place_visit"),
    place: CommunityPlanPlaceProjectionSchema
  })
  .strict();

export const CommunityPlanEventAttendItemSchema = z
  .object({
    ...communityPlanItemBaseFields,
    ref_type: z.literal("event"),
    type: z.literal("event_attend"),
    event: CommunityPlanEventProjectionSchema
  })
  .strict();

export const CommunityPlanItemSchema = z.discriminatedUnion("type", [
  CommunityPlanPlaceVisitItemSchema,
  CommunityPlanEventAttendItemSchema
]);

// --- Route kind ---

export const COMMUNITY_PLAN_ROUTE_KINDS = ["place_event"] as const;

export const CommunityPlanRouteKindSchema = z.enum(COMMUNITY_PLAN_ROUTE_KINDS);

// --- AI narration enhancement (strict allowlist) ---

export const CommunityPlanAIEnhancementItemSchema = z
  .object({
    item_id: z.string(),
    summary_zh: z.string().max(240),
    summary_en: z.string().max(240),
    tips_zh: z.string().max(160),
    tips_en: z.string().max(160)
  })
  .strict();

export const CommunityPlanAIEnhancementSchema = z
  .object({
    items: z.array(CommunityPlanAIEnhancementItemSchema).length(2)
  })
  .strict()
  .superRefine((enhancement, ctx) => {
    const itemIds = enhancement.items.map((item) => item.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI enhancement item_id values must be unique",
        path: ["items"]
      });
    }
  });

/**
 * Binds the strict narration-only payload to the deterministic plan item IDs.
 * The base schema enforces the fixed two-item MVP shape; this schema also
 * missing, extra, or substituted IDs before narration is merged.
 */
export const createCommunityPlanAIEnhancementSchema = (
  expectedItemIds: readonly string[]
) => {
  const expectedIds = new Set(expectedItemIds);

  return CommunityPlanAIEnhancementSchema.superRefine((enhancement, ctx) => {
    const actualIds = new Set(enhancement.items.map((item) => item.item_id));
    const hasExactItemIds =
      actualIds.size === expectedIds.size &&
      [...expectedIds].every((itemId) => actualIds.has(itemId));

    if (!hasExactItemIds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI enhancement item_id set must match the source plan",
        path: ["items"]
      });
    }
  });
};

// --- Usage (only for successful AI output) ---

export const CommunityPlanUsageSchema = z.object({
  prompt_tokens: z.number().int().nonnegative(),
  completion_tokens: z.number().int().nonnegative(),
  total_tokens: z.number().int().positive()
});

// --- Community Plan (invariant-checked) ---

export const CommunityPlanSchema = z
  .object({
    plan_id: z.string(),
    community_id: z.literal("tongzilin"),
    generated_at: z.string(),
    items: z.array(CommunityPlanItemSchema).length(2),
    total_duration_minutes: z.literal(120),
    route_kind: CommunityPlanRouteKindSchema,
    generation_source: CommunityPlanGenerationSourceSchema,
    ai_status: CommunityPlanAiStatusSchema,
    generated_by: z.string().min(1),
    usage: CommunityPlanUsageSchema.optional()
  })
  .strict()
  .superRefine((plan, ctx) => {
    const placeVisits = plan.items.filter((i) => i.type === "place_visit");
    const eventAttends = plan.items.filter((i) => i.type === "event_attend");

    if (placeVisits.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Plan must contain exactly one place_visit item",
        path: ["items"]
      });
    }
    if (eventAttends.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Plan must contain exactly one event_attend item",
        path: ["items"]
      });
    }

    // Unique item_ids
    const itemIds = plan.items.map((i) => i.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "item_id values must be unique",
        path: ["items"]
      });
    }

    // Unique ref_ids
    const refIds = plan.items.map((i) => i.ref_id);
    if (new Set(refIds).size !== refIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ref_id values must be unique",
        path: ["items"]
      });
    }

    // Chronologically ordered by start_offset_minutes
    for (let i = 1; i < plan.items.length; i++) {
      if (
        plan.items[i].start_offset_minutes <
        plan.items[i - 1].start_offset_minutes
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Items must be chronologically ordered by start_offset_minutes",
          path: ["items", i]
        });
      }
    }

    // Non-overlapping and end at most minute 120
    for (let i = 0; i < plan.items.length; i++) {
      const item = plan.items[i];
      const end = item.start_offset_minutes + item.duration_minutes;
      if (end > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${item.item_id} ends after minute 120`,
          path: ["items", i]
        });
      }
      if (i > 0) {
        const prev = plan.items[i - 1];
        const prevEnd = prev.start_offset_minutes + prev.duration_minutes;
        if (item.start_offset_minutes < prevEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Item ${item.item_id} overlaps with previous item`,
            path: ["items", i]
          });
        }
      }
    }

    // total_duration_minutes equals sum of item durations
    const sumDurations = plan.items.reduce(
      (sum, i) => sum + i.duration_minutes,
      0
    );
    if (plan.total_duration_minutes !== sumDurations) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "total_duration_minutes must equal the sum of all item durations",
        path: ["total_duration_minutes"]
      });
    }

    // Generation source and AI status describe one unambiguous outcome.
    const hasValidGenerationOutcome =
      (plan.generation_source === "rule_based" &&
        plan.ai_status === "not_configured") ||
      (plan.generation_source === "ai_enhanced" && plan.ai_status === "ok") ||
      (plan.generation_source === "rule_based_fallback" &&
        [
          "timeout",
          "validation_failed",
          "upstream_error",
          "unavailable"
        ].includes(plan.ai_status));

    if (!hasValidGenerationOutcome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "generation_source and ai_status must describe a valid outcome",
        path: ["ai_status"]
      });
    }

    // usage present only for successful AI output
    const isAiSuccess =
      plan.generation_source === "ai_enhanced" && plan.ai_status === "ok";
    if (isAiSuccess && plan.usage === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "usage must be present when generation_source is ai_enhanced and ai_status is ok",
        path: ["usage"]
      });
    }
    if (!isAiSuccess && plan.usage !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "usage must only be present for successful AI output",
        path: ["usage"]
      });
    }
  });

// --- Offline bundle (strict, public-safe) ---

export const CommunityPlanOfflineBundleSchema = z
  .object({
    version: z.string(),
    plan: CommunityPlanSchema,
    markers: z.array(CommunityPlanPlaceProjectionSchema),
    places: z.array(CommunityPlanPlaceProjectionSchema),
    events: z.array(CommunityPlanEventProjectionSchema)
  })
  .strict();
