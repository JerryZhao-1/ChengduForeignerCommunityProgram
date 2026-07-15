import {
  COMMUNITY_PLAN_CATALOG_VERSION,
  COMMUNITY_PLAN_DEMO_EVENT_ID,
  COMMUNITY_PLAN_FEEDBACK_CATALOG,
  COMPETITION_DEMO_NOW,
  COMPETITION_JUDGE_SCENARIOS,
  CommunityPlanEventProjectionSchema,
  CommunityPlanPlaceProjectionSchema,
  CommunityPlanSchema,
  INTEREST_CATEGORY_MAP,
  buildCommunityPlanScenarioKey,
  createCompetitionDemoEngineInput,
  enumerateCommunityPlanLocalizedCases,
  enumerateCommunityPlanScenarios,
  filterEventCandidates,
  filterPlaceCandidates,
  generateCommunityPlan,
  generateJudgeScenarioPlan,
  getCompetitionDemoEventProjections,
  getCompetitionDemoPlaceProjections,
  scorePlace
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

const basePreference = COMPETITION_JUDGE_SCENARIOS[0];
const places = getCompetitionDemoPlaceProjections();
const events = getCompetitionDemoEventProjections();

describe("community plan exhaustive curated coverage", () => {
  const scenarios = enumerateCommunityPlanScenarios();
  const plans = scenarios.map((preference) =>
    generateCommunityPlan(createCompetitionDemoEngineInput(preference))
  );

  it("covers 576 logical scenarios and 1,152 localized cases", () => {
    expect(scenarios).toHaveLength(576);
    expect(enumerateCommunityPlanLocalizedCases()).toHaveLength(1152);
  });

  it("creates 576 unique stable scenario keys", () => {
    expect(new Set(plans.map((plan) => plan.scenario_key)).size).toBe(576);
    expect(
      plans.every(
        (plan, index) =>
          plan.scenario_key === buildCommunityPlanScenarioKey(scenarios[index])
      )
    ).toBe(true);
  });

  it("produces only schema-valid plans with complete bilingual feedback", () => {
    for (const plan of plans) {
      expect(CommunityPlanSchema.safeParse(plan).success).toBe(true);
      expect(plan.catalog_version).toBe(COMMUNITY_PLAN_CATALOG_VERSION);
      expect(plan.selection_explanation.summary_zh).toBeTruthy();
      expect(plan.selection_explanation.summary_en).toBeTruthy();
      expect(plan.selection_explanation.reasons).toHaveLength(4);
      for (const reason of plan.selection_explanation.reasons) {
        expect(reason.text_zh).toBeTruthy();
        expect(reason.text_en).toBeTruthy();
      }
    }
  });

  it("maps every generated reason to the selected bilingual dimension module", () => {
    const catalogEntryFor = (
      preference: (typeof scenarios)[number],
      dimension: (typeof plans)[number]["selection_explanation"]["reasons"][number]["dimension"]
    ) => {
      switch (dimension) {
        case "primary_interest":
          return COMMUNITY_PLAN_FEEDBACK_CATALOG.primary_interest[
            preference.primary_interest
          ];
        case "arrival_context":
          return COMMUNITY_PLAN_FEEDBACK_CATALOG.arrival_context[
            preference.arrival_context
          ];
        case "household_type":
          return COMMUNITY_PLAN_FEEDBACK_CATALOG.household_type[
            preference.household_type
          ];
        case "accessibility_need":
          return COMMUNITY_PLAN_FEEDBACK_CATALOG.accessibility_need[
            preference.accessibility_need
          ];
      }
    };

    plans.forEach((plan, index) => {
      plan.selection_explanation.reasons.forEach((reason) => {
        const module = catalogEntryFor(scenarios[index], reason.dimension);
        if (!module) {
          throw new Error(
            `Missing feedback module for ${plan.scenario_key}:${reason.dimension}`
          );
        }
        expect(reason.text_zh).toBe(module.reason_zh);
        expect(reason.text_en).toBe(module.reason_en);
      });
    });
  });

  it("matches zh and en profiles to identical semantic plans", () => {
    for (const scenario of scenarios) {
      const zhPlan = generateCommunityPlan(
        createCompetitionDemoEngineInput({
          ...scenario,
          preferred_language: "zh"
        })
      );
      const enPlan = generateCommunityPlan(
        createCompetitionDemoEngineInput({
          ...scenario,
          preferred_language: "en"
        })
      );
      expect(enPlan).toEqual(zhPlan);
    }
  });

  it("reports the required machine-decidable coverage summary", () => {
    const catalog = COMMUNITY_PLAN_FEEDBACK_CATALOG;
    const moduleFor = (
      preference: (typeof scenarios)[number],
      dimension: (typeof plans)[number]["selection_explanation"]["reasons"][number]["dimension"]
    ) => {
      switch (dimension) {
        case "primary_interest":
          return catalog.primary_interest[preference.primary_interest];
        case "arrival_context":
          return catalog.arrival_context[preference.arrival_context];
        case "household_type":
          return catalog.household_type[preference.household_type];
        case "accessibility_need":
          return catalog.accessibility_need[preference.accessibility_need];
      }
    };
    const bilingualDimensionModules =
      Object.keys(catalog.primary_interest).length +
      Object.keys(catalog.arrival_context).length +
      Object.keys(catalog.household_type).length +
      Object.keys(catalog.accessibility_need).length;
    const reasonModuleMismatches = plans.filter((plan, index) =>
      plan.selection_explanation.reasons.some((reason) => {
        const module = moduleFor(scenarios[index], reason.dimension);
        return (
          !module ||
          reason.text_zh !== module.reason_zh ||
          reason.text_en !== module.reason_en
        );
      })
    ).length;
    const summary = {
      bilingualDimensionModules,
      logicalScenarios: scenarios.length,
      uniqueScenarioKeys: new Set(plans.map((plan) => plan.scenario_key)).size,
      localizedRenderCases: enumerateCommunityPlanLocalizedCases().length,
      invalidPlans: plans.filter(
        (plan) => !CommunityPlanSchema.safeParse(plan).success
      ).length,
      missingCopy: plans.filter((plan) =>
        plan.selection_explanation.reasons.some(
          (reason) => !reason.text_zh || !reason.text_en
        )
      ).length,
      reasonModuleMismatches
    };
    expect(summary).toEqual({
      bilingualDimensionModules: 21,
      logicalScenarios: 576,
      uniqueScenarioKeys: 576,
      localizedRenderCases: 1152,
      invalidPlans: 0,
      missingCopy: 0,
      reasonModuleMismatches: 0
    });
  });
});

describe("community plan deterministic selection", () => {
  it("returns the same plan repeatedly", () => {
    const input = createCompetitionDemoEngineInput(basePreference);
    expect(generateCommunityPlan(input)).toEqual(generateCommunityPlan(input));
  });

  it("uses primary interest as the strongest place signal", () => {
    const transportPlace = places.find(
      (place) => place.category_level_1 === "transport"
    );
    if (!transportPlace) throw new Error("missing transport fixture");
    expect(
      scorePlace(transportPlace, {
        ...basePreference,
        primary_interest: "transport"
      })
    ).toBeGreaterThan(
      scorePlace(transportPlace, {
        ...basePreference,
        primary_interest: "food-drink"
      })
    );
  });

  it("selects the first available category for every primary interest", () => {
    for (const preference of enumerateCommunityPlanScenarios()) {
      const plan = generateCommunityPlan(
        createCompetitionDemoEngineInput(preference)
      );
      const placeItem = plan.items.find((item) => item.type === "place_visit");
      const expectedCategory = INTEREST_CATEGORY_MAP[
        preference.primary_interest
      ].find((category) =>
        places.some((place) => place.category_level_1 === category)
      );

      expect(placeItem?.place.category_level_1).toBe(expectedCategory);
    }
  });

  it("keeps accessibility feedback advisory", () => {
    const plan = generateCommunityPlan(
      createCompetitionDemoEngineInput({
        ...basePreference,
        accessibility_need: "wheelchair"
      })
    );
    const accessibilityReason = plan.selection_explanation.reasons[3];
    expect(accessibilityReason.text_zh).toContain("没有认证");
    expect(accessibilityReason.text_en).toContain("does not certify");
  });
});

describe("community plan safe fixtures and failures", () => {
  it("keeps only valid safe projections", () => {
    expect(filterPlaceCandidates(places).length).toBeGreaterThanOrEqual(10);
    expect(
      filterEventCandidates(events, COMPETITION_DEMO_NOW).map(
        (event) => event._id
      )
    ).toEqual([COMMUNITY_PLAN_DEMO_EVENT_ID]);
    for (const place of places) {
      expect(CommunityPlanPlaceProjectionSchema.safeParse(place).success).toBe(
        true
      );
    }
    for (const event of events) {
      expect(CommunityPlanEventProjectionSchema.safeParse(event).success).toBe(
        true
      );
    }
  });

  it("fails when curated data is missing", () => {
    expect(() =>
      generateCommunityPlan(
        createCompetitionDemoEngineInput(basePreference, { places: [] })
      )
    ).toThrow(/no valid curated place/);
    expect(() =>
      generateCommunityPlan(
        createCompetitionDemoEngineInput(basePreference, {
          curatedEventId: "event_missing"
        })
      )
    ).toThrow(/curated event is unavailable/);
  });

  it("does not substitute an unrelated place when an interest category is missing", () => {
    const unrelatedPlaces = places.filter(
      (place) => place.category_level_1 === "food-drink"
    );
    expect(unrelatedPlaces.length).toBeGreaterThan(0);
    expect(() =>
      generateCommunityPlan(
        createCompetitionDemoEngineInput(
          { ...basePreference, primary_interest: "transport" },
          { places: unrelatedPlaces }
        )
      )
    ).toThrow(/no valid curated place for transport/);
  });

  it("keeps all three judge scenarios deterministic and valid", () => {
    expect(COMPETITION_JUDGE_SCENARIOS).toHaveLength(3);
    for (let index = 0; index < COMPETITION_JUDGE_SCENARIOS.length; index++) {
      const first = generateJudgeScenarioPlan(index);
      const second = generateJudgeScenarioPlan(index);
      expect(first).toEqual(second);
      expect(CommunityPlanSchema.safeParse(first).success).toBe(true);
    }
  });
});
