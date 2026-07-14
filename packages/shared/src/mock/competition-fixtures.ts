import type { NewResidentPreference } from "../types/entities";
import { createMockDataset } from "./data";
import {
  generateCommunityPlan,
  projectEvent,
  projectPlace,
  filterPlaceCandidates,
  filterEventCandidates,
  type CommunityPlanEngineInput
} from "../community-plan/engine";
import { COMMUNITY_PLAN_DEMO_EVENT_ID } from "./community-plan-offline-bundle";

/**
 * Deterministic timestamp used by the competition demo fixtures. The engine
 * never calls Date.now(); all filtering uses this fixed value so identical
 * inputs always produce identical outputs.
 */
export const COMPETITION_DEMO_NOW = "2027-04-02T09:00:00+08:00";

/**
 * Three judge scenarios that exercise different preference profiles and
 * produce meaningfully different Community Plans. Each scenario is a valid
 * NewResidentPreference that the engine can score and select against.
 */
export const COMPETITION_JUDGE_SCENARIOS: NewResidentPreference[] = [
  {
    preferred_language: "zh",
    interests: ["community-service", "social"],
    arrival_context: "first-week",
    household_type: "solo",
    accessibility_needs: []
  },
  {
    preferred_language: "en",
    interests: ["family-kids", "outdoor-sports"],
    arrival_context: "first-month",
    household_type: "family-with-kids",
    accessibility_needs: []
  },
  {
    preferred_language: "zh",
    interests: ["food-drink", "social"],
    arrival_context: "settled",
    household_type: "couple",
    accessibility_needs: []
  }
];

/**
 * Creates a Community Plan engine input preconfigured with the competition
 * demo dataset and the curated demo event. Callers only need to supply a
 * preference.
 */
export function createCompetitionDemoEngineInput(
  preference: NewResidentPreference,
  overrides: Partial<CommunityPlanEngineInput> = {}
): CommunityPlanEngineInput {
  const dataset = createMockDataset();
  return {
    preference,
    places: filterPlaceCandidates(
      dataset.places
        .filter(
          (place) =>
            place.community_id === "tongzilin" && place.status === "published"
        )
        .map(projectPlace)
    ),
    events: filterEventCandidates(
      dataset.events
        .filter(
          (event) =>
            event.community_id === "tongzilin" &&
            event.review_status === "approved" &&
            event.publish_status === "published"
        )
        .map(projectEvent),
      COMPETITION_DEMO_NOW
    ),
    curatedEventId: COMMUNITY_PLAN_DEMO_EVENT_ID,
    now: COMPETITION_DEMO_NOW,
    ...overrides
  };
}

/**
 * Generates a deterministic Community Plan for a judge scenario by index.
 * Index 0, 1, 2 correspond to COMPETITION_JUDGE_SCENARIOS entries.
 */
export function generateJudgeScenarioPlan(
  scenarioIndex: number
): ReturnType<typeof generateCommunityPlan> {
  const preference = COMPETITION_JUDGE_SCENARIOS[scenarioIndex];
  if (!preference) {
    throw new Error(
      `Invalid judge scenario index: ${scenarioIndex}. Valid range: 0-${COMPETITION_JUDGE_SCENARIOS.length - 1}.`
    );
  }
  const input = createCompetitionDemoEngineInput(preference);
  return generateCommunityPlan(input);
}

/**
 * Returns all public-safe place projections from the competition demo
 * dataset. Used by the offline bundle and the route-map view.
 */
export function getCompetitionDemoPlaceProjections() {
  const dataset = createMockDataset();
  return filterPlaceCandidates(
    dataset.places
      .filter(
        (place) =>
          place.community_id === "tongzilin" && place.status === "published"
      )
      .map(projectPlace)
  );
}

/**
 * Returns all public-safe event projections from the competition demo
 * dataset. Used by the offline bundle.
 */
export function getCompetitionDemoEventProjections() {
  const dataset = createMockDataset();
  return filterEventCandidates(
    dataset.events
      .filter(
        (event) =>
          event.community_id === "tongzilin" &&
          event.review_status === "approved" &&
          event.publish_status === "published"
      )
      .map(projectEvent),
    COMPETITION_DEMO_NOW
  );
}
