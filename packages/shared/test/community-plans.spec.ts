import {
  API_ERROR_CODES,
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS,
  COMMUNITY_PLAN_ARRIVAL_CONTEXTS,
  COMMUNITY_PLAN_CATALOG_VERSION,
  COMMUNITY_PLAN_FEEDBACK_DIMENSIONS,
  COMMUNITY_PLAN_HOUSEHOLD_TYPES,
  COMMUNITY_PLAN_INTERESTS,
  CommunityPlanCatalogBundleSchema,
  CommunityPlanEventProjectionSchema,
  CommunityPlanPlaceProjectionSchema,
  CommunityPlanScenarioKeySchema,
  CommunityPlanSchema,
  NewResidentPreferenceSchema,
  apiPaths,
  communityPlanCatalogBundle,
  communityPlanContracts,
  generateJudgeScenarioPlan
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

const validPreference = {
  preferred_language: "zh",
  primary_interest: "community-service",
  arrival_context: "first-week",
  household_type: "solo",
  accessibility_need: "none"
} as const;

const basePlan = generateJudgeScenarioPlan(0);

describe("community plan singular preference", () => {
  it("accepts all five required singular fields", () => {
    expect(NewResidentPreferenceSchema.parse(validPreference)).toEqual(
      validPreference
    );
  });

  it("rejects missing required fields", () => {
    const missingAccessibility = {
      preferred_language: validPreference.preferred_language,
      primary_interest: validPreference.primary_interest,
      arrival_context: validPreference.arrival_context,
      household_type: validPreference.household_type
    };
    expect(
      NewResidentPreferenceSchema.safeParse(missingAccessibility).success
    ).toBe(false);
  });

  it("rejects legacy arrays and unknown fields", () => {
    for (const legacy of [
      { ...validPreference, interests: ["community-service"] },
      { ...validPreference, accessibility_needs: [] },
      { ...validPreference, community_id: "tongzilin" },
      { ...validPreference, phone: "13800000000" },
      { ...validPreference, notes: "free text" }
    ]) {
      expect(NewResidentPreferenceSchema.safeParse(legacy).success).toBe(false);
    }
  });

  it("rejects invalid enum values", () => {
    expect(
      NewResidentPreferenceSchema.safeParse({
        ...validPreference,
        primary_interest: "unknown"
      }).success
    ).toBe(false);
    expect(
      NewResidentPreferenceSchema.safeParse({
        ...validPreference,
        accessibility_need: "sometimes"
      }).success
    ).toBe(false);
  });
});

describe("community plan explainable response", () => {
  it("accepts the curated canonical plan", () => {
    const parsed = CommunityPlanSchema.parse(basePlan);
    expect(parsed.catalog_version).toBe(COMMUNITY_PLAN_CATALOG_VERSION);
    expect(
      parsed.selection_explanation.reasons.map((reason) => reason.dimension)
    ).toEqual(COMMUNITY_PLAN_FEEDBACK_DIMENSIONS);
  });

  it("rejects missing or reordered explanation reasons", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        selection_explanation: {
          ...basePlan.selection_explanation,
          reasons: basePlan.selection_explanation.reasons.slice(0, 3)
        }
      }).success
    ).toBe(false);
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        selection_explanation: {
          ...basePlan.selection_explanation,
          reasons: [
            basePlan.selection_explanation.reasons[1],
            basePlan.selection_explanation.reasons[0],
            basePlan.selection_explanation.reasons[2],
            basePlan.selection_explanation.reasons[3]
          ]
        }
      }).success
    ).toBe(false);
  });

  it("rejects legacy model-result fields", () => {
    for (const legacyField of [
      { generation_source: "rule_based" },
      { ai_status: "not_configured" },
      { usage: { total_tokens: 1 } },
      { generated_by: "legacy-engine" }
    ]) {
      expect(
        CommunityPlanSchema.safeParse({ ...basePlan, ...legacyField }).success
      ).toBe(false);
    }
  });

  it("retains item and timing invariants", () => {
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [
          { ...basePlan.items[0], duration_minutes: 90 },
          basePlan.items[1]
        ]
      }).success
    ).toBe(false);
    expect(
      CommunityPlanSchema.safeParse({
        ...basePlan,
        items: [basePlan.items[1], basePlan.items[0]]
      }).success
    ).toBe(false);
  });

  it("validates scenario key format", () => {
    expect(
      CommunityPlanScenarioKeySchema.safeParse(
        "v1:food-drink:settled:couple:quiet-environment"
      ).success
    ).toBe(true);
    expect(
      CommunityPlanScenarioKeySchema.safeParse(
        "v1:food-drink:settled:couple:unknown"
      ).success
    ).toBe(false);
  });
});

describe("community plan safe catalog bundle", () => {
  it("contains every feedback key exactly once", () => {
    const catalog = communityPlanCatalogBundle.feedback_catalog;
    expect(Object.keys(catalog.primary_interest).sort()).toEqual(
      [...COMMUNITY_PLAN_INTERESTS].sort()
    );
    expect(Object.keys(catalog.arrival_context).sort()).toEqual(
      [...COMMUNITY_PLAN_ARRIVAL_CONTEXTS].sort()
    );
    expect(Object.keys(catalog.household_type).sort()).toEqual(
      [...COMMUNITY_PLAN_HOUSEHOLD_TYPES].sort()
    );
    expect(Object.keys(catalog.accessibility_need).sort()).toEqual(
      [...COMMUNITY_PLAN_ACCESSIBILITY_NEEDS].sort()
    );
    expect(
      Object.values(catalog).reduce(
        (total, dimension) => total + Object.keys(dimension).length,
        0
      )
    ).toBe(21);
  });

  it("rejects unsafe place and event fields", () => {
    const place = communityPlanCatalogBundle.places[0];
    const event = communityPlanCatalogBundle.events[0];
    expect(
      CommunityPlanPlaceProjectionSchema.safeParse({
        ...place,
        address_zh: "secret address"
      }).success
    ).toBe(false);
    expect(
      CommunityPlanEventProjectionSchema.safeParse({
        ...event,
        capacity: 30
      }).success
    ).toBe(false);
  });

  it("rejects missing curated event and unknown top-level fields", () => {
    expect(
      CommunityPlanCatalogBundleSchema.safeParse({
        ...communityPlanCatalogBundle,
        curated_event_id: "event_missing"
      }).success
    ).toBe(false);
    expect(
      CommunityPlanCatalogBundleSchema.safeParse({
        ...communityPlanCatalogBundle,
        admin_payload: true
      }).success
    ).toBe(false);
  });
});

describe("community plan contract surface", () => {
  it("exposes only POST generation", () => {
    expect(apiPaths.communityPlan.generate).toBe("/community-plan/generate");
    expect(communityPlanContracts.generate.method).toBe("POST");
    expect(communityPlanContracts.generate.request).toBe(
      NewResidentPreferenceSchema
    );
    expect(communityPlanContracts.generate.response).toBe(CommunityPlanSchema);
    expect(Object.keys(apiPaths.communityPlan)).toEqual(["generate"]);
  });

  it("keeps RATE_LIMITED in the stable error enum", () => {
    expect(API_ERROR_CODES).toContain("RATE_LIMITED");
  });
});
