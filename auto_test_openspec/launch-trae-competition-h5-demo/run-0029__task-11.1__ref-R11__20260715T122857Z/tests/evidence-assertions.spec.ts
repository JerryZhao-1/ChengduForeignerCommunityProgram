import {
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS,
  COMMUNITY_PLAN_FEEDBACK_DIMENSIONS,
  COMMUNITY_PLAN_INTERESTS,
  CommunityPlanSchema,
  NewResidentPreferenceSchema,
  apiPaths,
  communityPlanContracts,
  createMockClient,
  generateJudgeScenarioPlan
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

describe("R11 corrected evidence", () => {
  it("derives the singular contract and minimal client surface", () => {
    const preference = {
      preferred_language: "zh",
      primary_interest: "community-service",
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_need: "none"
    } as const;
    const requiredKeys = Object.keys(preference);

    expect(requiredKeys).toHaveLength(5);
    expect(COMMUNITY_PLAN_INTERESTS).toHaveLength(8);
    expect(COMMUNITY_PLAN_ACCESSIBILITY_NEEDS).toHaveLength(6);
    expect(NewResidentPreferenceSchema.parse(preference)).toEqual(preference);

    for (const key of requiredKeys) {
      const partial: Record<string, unknown> = { ...preference };
      delete partial[key];
      expect(NewResidentPreferenceSchema.safeParse(partial).success).toBe(false);
      expect(
        NewResidentPreferenceSchema.safeParse({
          ...preference,
          [key]: [preference[key as keyof typeof preference]]
        }).success
      ).toBe(false);
    }

    const plan = generateJudgeScenarioPlan(0);
    expect(
      plan.selection_explanation.reasons.map((reason) => reason.dimension)
    ).toEqual(COMMUNITY_PLAN_FEEDBACK_DIMENSIONS);
    for (const field of [
      "generation_source",
      "ai_status",
      "usage",
      "generated_by",
      "model",
      "prompt"
    ]) {
      expect(
        CommunityPlanSchema.safeParse({ ...plan, [field]: "forbidden" }).success
      ).toBe(false);
    }

    expect(Object.keys(apiPaths.communityPlan)).toEqual(["generate"]);
    expect(communityPlanContracts.generate.method).toBe("POST");
    expect(Object.keys(createMockClient({}).communityPlan)).toEqual(["generate"]);
  });
});
