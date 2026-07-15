import type { NewResidentPreference } from "../types/entities";
import {
  generateCommunityPlan,
  type CommunityPlanEngineInput
} from "../community-plan/engine";
import {
  COMMUNITY_PLAN_DEMO_EVENT_ID,
  COMPETITION_CATALOG_NOW,
  communityPlanCatalogBundle
} from "./community-plan-offline-bundle";

export const COMPETITION_DEMO_NOW = COMPETITION_CATALOG_NOW;

export const COMPETITION_JUDGE_SCENARIOS: NewResidentPreference[] = [
  {
    preferred_language: "zh",
    primary_interest: "community-service",
    arrival_context: "first-week",
    household_type: "solo",
    accessibility_need: "none"
  },
  {
    preferred_language: "en",
    primary_interest: "family-kids",
    arrival_context: "first-month",
    household_type: "family-with-kids",
    accessibility_need: "low-mobility"
  },
  {
    preferred_language: "zh",
    primary_interest: "food-drink",
    arrival_context: "settled",
    household_type: "couple",
    accessibility_need: "quiet-environment"
  }
];

export function createCompetitionDemoEngineInput(
  preference: NewResidentPreference,
  overrides: Partial<CommunityPlanEngineInput> = {}
): CommunityPlanEngineInput {
  return {
    preference,
    places: communityPlanCatalogBundle.places,
    events: communityPlanCatalogBundle.events,
    curatedEventId: COMMUNITY_PLAN_DEMO_EVENT_ID,
    now: COMPETITION_DEMO_NOW,
    ...overrides
  };
}

export function generateJudgeScenarioPlan(scenarioIndex: number) {
  const preference = COMPETITION_JUDGE_SCENARIOS[scenarioIndex];
  if (!preference) {
    throw new Error(
      `Invalid judge scenario index: ${scenarioIndex}. Valid range: 0-${COMPETITION_JUDGE_SCENARIOS.length - 1}.`
    );
  }
  return generateCommunityPlan(createCompetitionDemoEngineInput(preference));
}

export const getCompetitionDemoPlaceProjections = () =>
  communityPlanCatalogBundle.places;

export const getCompetitionDemoEventProjections = () =>
  communityPlanCatalogBundle.events;
