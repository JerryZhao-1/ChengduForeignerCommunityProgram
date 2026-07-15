import { z } from "zod";

import { LocaleSchema } from "./common";
import { PlaceTopLevelCategorySchema } from "./place-categories";

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
  "none",
  "wheelchair",
  "low-vision",
  "low-mobility",
  "hearing-support",
  "quiet-environment"
] as const;

export const CommunityPlanAccessibilityNeedSchema = z.enum(
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS
);
export type CommunityPlanAccessibilityNeed = z.infer<
  typeof CommunityPlanAccessibilityNeedSchema
>;

export const NewResidentPreferenceSchema = z
  .object({
    preferred_language: LocaleSchema,
    primary_interest: CommunityPlanInterestSchema,
    arrival_context: CommunityPlanArrivalContextSchema,
    household_type: CommunityPlanHouseholdTypeSchema,
    accessibility_need: CommunityPlanAccessibilityNeedSchema
  })
  .strict();

export const CommunityPlanPlaceProjectionSchema = z
  .object({
    _id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    cover_url: z.string().url().nullable(),
    category_level_1: PlaceTopLevelCategorySchema,
    is_recommended: z.boolean(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
      })
      .strict()
  })
  .strict();

export const CommunityPlanEventProjectionSchema = z
  .object({
    _id: z.string(),
    title_zh: z.string(),
    title_en: z.string(),
    summary_zh: z.string(),
    summary_en: z.string(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    cover_url: z.string().url()
  })
  .strict();

export const CommunityPlanItemStatusSchema = z.literal("pending");

const communityPlanItemBaseFields = {
  item_id: z.string(),
  ref_id: z.string(),
  start_offset_minutes: z.number().int().min(0),
  duration_minutes: z.number().int().positive(),
  title_zh: z.string().min(1),
  title_en: z.string().min(1),
  summary_zh: z.string().min(1),
  summary_en: z.string().min(1),
  tips_zh: z.string().min(1),
  tips_en: z.string().min(1),
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

export const COMMUNITY_PLAN_ROUTE_KINDS = ["place_event"] as const;
export const CommunityPlanRouteKindSchema = z.enum(COMMUNITY_PLAN_ROUTE_KINDS);

export const COMMUNITY_PLAN_CATALOG_VERSION = "tongzilin-curated-v1" as const;
export const CommunityPlanCatalogVersionSchema = z.literal(
  COMMUNITY_PLAN_CATALOG_VERSION
);

const interestPattern = COMMUNITY_PLAN_INTERESTS.join("|");
const arrivalPattern = COMMUNITY_PLAN_ARRIVAL_CONTEXTS.join("|");
const householdPattern = COMMUNITY_PLAN_HOUSEHOLD_TYPES.join("|");
const accessibilityPattern = COMMUNITY_PLAN_ACCESSIBILITY_NEEDS.join("|");

export const CommunityPlanScenarioKeySchema = z.string().regex(
  new RegExp(
    `^v1:(${interestPattern}):(${arrivalPattern}):(${householdPattern}):(${accessibilityPattern})$`
  )
);

export const COMMUNITY_PLAN_FEEDBACK_DIMENSIONS = [
  "primary_interest",
  "arrival_context",
  "household_type",
  "accessibility_need"
] as const;

export const CommunityPlanFeedbackDimensionSchema = z.enum(
  COMMUNITY_PLAN_FEEDBACK_DIMENSIONS
);

const feedbackTextFields = {
  text_zh: z.string().min(1),
  text_en: z.string().min(1)
};

export const CommunityPlanFeedbackReasonSchema = z.discriminatedUnion(
  "dimension",
  [
    z.object({ dimension: z.literal("primary_interest"), ...feedbackTextFields }).strict(),
    z.object({ dimension: z.literal("arrival_context"), ...feedbackTextFields }).strict(),
    z.object({ dimension: z.literal("household_type"), ...feedbackTextFields }).strict(),
    z.object({ dimension: z.literal("accessibility_need"), ...feedbackTextFields }).strict()
  ]
);

export const CommunityPlanSelectionExplanationSchema = z
  .object({
    summary_zh: z.string().min(1),
    summary_en: z.string().min(1),
    reasons: z.tuple([
      z.object({ dimension: z.literal("primary_interest"), ...feedbackTextFields }).strict(),
      z.object({ dimension: z.literal("arrival_context"), ...feedbackTextFields }).strict(),
      z.object({ dimension: z.literal("household_type"), ...feedbackTextFields }).strict(),
      z.object({ dimension: z.literal("accessibility_need"), ...feedbackTextFields }).strict()
    ])
  })
  .strict();

export const CommunityPlanSchema = z
  .object({
    plan_id: z.string(),
    community_id: z.literal("tongzilin"),
    generated_at: z.string().datetime({ offset: true }),
    scenario_key: CommunityPlanScenarioKeySchema,
    catalog_version: CommunityPlanCatalogVersionSchema,
    selection_explanation: CommunityPlanSelectionExplanationSchema,
    items: z.array(CommunityPlanItemSchema).length(2),
    total_duration_minutes: z.literal(120),
    route_kind: CommunityPlanRouteKindSchema
  })
  .strict()
  .superRefine((plan, ctx) => {
    const placeVisits = plan.items.filter((item) => item.type === "place_visit");
    const eventAttends = plan.items.filter((item) => item.type === "event_attend");

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

    for (let index = 0; index < plan.items.length; index++) {
      const item = plan.items[index];
      const projectionId =
        item.type === "place_visit" ? item.place._id : item.event._id;
      if (item.ref_id !== projectionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ref_id must match the embedded public projection ID",
          path: ["items", index, "ref_id"]
        });
      }

      if (item.type === "event_attend") {
        const generatedAtMs = Date.parse(plan.generated_at);
        const attendanceStartMs =
          generatedAtMs + item.start_offset_minutes * 60 * 1000;
        const attendanceEndMs =
          attendanceStartMs + item.duration_minutes * 60 * 1000;
        const eventStartMs = Date.parse(item.event.start_time);
        const eventEndMs = Date.parse(item.event.end_time);
        if (eventStartMs > attendanceStartMs || eventEndMs < attendanceEndMs) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "event must cover its complete attendance window in the plan",
            path: ["items", index, "event"]
          });
        }
      }
    }

    const itemIds = plan.items.map((item) => item.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "item_id values must be unique",
        path: ["items"]
      });
    }

    const refIds = plan.items.map((item) => item.ref_id);
    if (new Set(refIds).size !== refIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ref_id values must be unique",
        path: ["items"]
      });
    }

    for (let index = 0; index < plan.items.length; index++) {
      const item = plan.items[index];
      const end = item.start_offset_minutes + item.duration_minutes;
      if (end > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${item.item_id} ends after minute 120`,
          path: ["items", index]
        });
      }
      if (index > 0) {
        const previous = plan.items[index - 1];
        const previousEnd =
          previous.start_offset_minutes + previous.duration_minutes;
        if (item.start_offset_minutes < previous.start_offset_minutes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Items must be chronologically ordered",
            path: ["items", index]
          });
        }
        if (item.start_offset_minutes < previousEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Item ${item.item_id} overlaps with previous item`,
            path: ["items", index]
          });
        }
      }
    }

    const durationSum = plan.items.reduce(
      (sum, item) => sum + item.duration_minutes,
      0
    );
    if (durationSum !== plan.total_duration_minutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "total_duration_minutes must equal the duration sum",
        path: ["total_duration_minutes"]
      });
    }
  });

export const CommunityPlanCatalogTextSchema = z
  .object({
    summary_zh: z.string().min(1),
    summary_en: z.string().min(1),
    reason_zh: z.string().min(1),
    reason_en: z.string().min(1),
    tip_zh: z.string().min(1),
    tip_en: z.string().min(1)
  })
  .strict();
export const CommunityPlanFeedbackCatalogSchema = z
  .object({
    primary_interest: z.record(
      CommunityPlanInterestSchema,
      CommunityPlanCatalogTextSchema
    ),
    arrival_context: z.record(
      CommunityPlanArrivalContextSchema,
      CommunityPlanCatalogTextSchema
    ),
    household_type: z.record(
      CommunityPlanHouseholdTypeSchema,
      CommunityPlanCatalogTextSchema
    ),
    accessibility_need: z.record(
      CommunityPlanAccessibilityNeedSchema,
      CommunityPlanCatalogTextSchema
    )
  })
  .strict()
  .superRefine((catalog, ctx) => {
    const checks: Array<
      [keyof typeof catalog, readonly string[], Record<string, unknown>]
    > = [
      ["primary_interest", COMMUNITY_PLAN_INTERESTS, catalog.primary_interest],
      ["arrival_context", COMMUNITY_PLAN_ARRIVAL_CONTEXTS, catalog.arrival_context],
      ["household_type", COMMUNITY_PLAN_HOUSEHOLD_TYPES, catalog.household_type],
      [
        "accessibility_need",
        COMMUNITY_PLAN_ACCESSIBILITY_NEEDS,
        catalog.accessibility_need
      ]
    ];

    for (const [dimension, expectedKeys, record] of checks) {
      const actualKeys = Object.keys(record).sort();
      const expected = [...expectedKeys].sort();
      if (JSON.stringify(actualKeys) !== JSON.stringify(expected)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${dimension} catalog keys must exactly match the enum`,
          path: [dimension]
        });
      }
    }
  });

export const CommunityPlanCatalogBundleSchema = z
  .object({
    catalog_version: CommunityPlanCatalogVersionSchema,
    feedback_catalog: CommunityPlanFeedbackCatalogSchema,
    curated_event_id: z.string().min(1),
    places: z.array(CommunityPlanPlaceProjectionSchema).min(1),
    events: z.array(CommunityPlanEventProjectionSchema).min(1)
  })
  .strict()
  .superRefine((bundle, ctx) => {
    const placeIds = bundle.places.map((place) => place._id);
    const eventIds = bundle.events.map((event) => event._id);
    if (new Set(placeIds).size !== placeIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "catalog place IDs must be unique",
        path: ["places"]
      });
    }
    if (new Set(eventIds).size !== eventIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "catalog event IDs must be unique",
        path: ["events"]
      });
    }
    if (!eventIds.includes(bundle.curated_event_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "curated_event_id must reference a bundled event",
        path: ["curated_event_id"]
      });
    }
  });
