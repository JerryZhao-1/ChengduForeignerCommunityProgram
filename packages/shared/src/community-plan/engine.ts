import type {
  CommunityPlan,
  CommunityPlanEventProjection,
  CommunityPlanPlaceProjection,
  NewResidentPreference
} from "../types/entities";
import {
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS,
  COMMUNITY_PLAN_ARRIVAL_CONTEXTS,
  COMMUNITY_PLAN_CATALOG_VERSION,
  COMMUNITY_PLAN_HOUSEHOLD_TYPES,
  COMMUNITY_PLAN_INTERESTS,
  CommunityPlanSchema,
  type CommunityPlanAccessibilityNeed,
  type CommunityPlanArrivalContext,
  type CommunityPlanHouseholdType,
  type CommunityPlanInterest
} from "../schemas/community-plans";
import {
  ARRIVAL_CONTEXT_PRIORITY,
  HOUSEHOLD_TYPE_PRIORITY,
  INTEREST_CATEGORY_MAP,
  getAccessibilityFeedback,
  getArrivalFeedback,
  getEventNarration,
  getHouseholdFeedback,
  getInterestFeedback,
  getPlaceNarration
} from "./narration";

const PLACE_VISIT_DURATION_MINUTES = 60;
const EVENT_ATTEND_DURATION_MINUTES = 60;
const TARGET_TOTAL_MINUTES = 120;

export interface CommunityPlanEngineInput {
  preference: NewResidentPreference;
  places: CommunityPlanPlaceProjection[];
  events: CommunityPlanEventProjection[];
  curatedEventId: string;
  now: string;
  planId?: string;
  generatedAt?: string;
}

export interface ScoredPlace {
  place: CommunityPlanPlaceProjection;
  score: number;
}

export interface ScoredEvent {
  event: CommunityPlanEventProjection;
  score: number;
}

export const buildCommunityPlanScenarioKey = (
  preference: Pick<
    NewResidentPreference,
    | "primary_interest"
    | "arrival_context"
    | "household_type"
    | "accessibility_need"
  >
): string =>
  [
    "v1",
    preference.primary_interest,
    preference.arrival_context,
    preference.household_type,
    preference.accessibility_need
  ].join(":");

export const enumerateCommunityPlanScenarios = (): NewResidentPreference[] => {
  const scenarios: NewResidentPreference[] = [];
  for (const primary_interest of COMMUNITY_PLAN_INTERESTS) {
    for (const arrival_context of COMMUNITY_PLAN_ARRIVAL_CONTEXTS) {
      for (const household_type of COMMUNITY_PLAN_HOUSEHOLD_TYPES) {
        for (const accessibility_need of COMMUNITY_PLAN_ACCESSIBILITY_NEEDS) {
          scenarios.push({
            preferred_language: "zh",
            primary_interest,
            arrival_context,
            household_type,
            accessibility_need
          });
        }
      }
    }
  }
  return scenarios;
};

export const enumerateCommunityPlanLocalizedCases = (): NewResidentPreference[] =>
  enumerateCommunityPlanScenarios().flatMap((preference) => [
    { ...preference, preferred_language: "zh" },
    { ...preference, preferred_language: "en" }
  ]);

export const filterPlaceCandidates = (
  places: CommunityPlanPlaceProjection[]
): CommunityPlanPlaceProjection[] =>
  places.filter((place) => isValidCoordinate(place.location));

export function filterEventCandidates(
  events: CommunityPlanEventProjection[],
  now: string
): CommunityPlanEventProjection[] {
  const nowMs = Date.parse(now);
  if (Number.isNaN(nowMs)) return [];
  const attendanceStartMs = nowMs + PLACE_VISIT_DURATION_MINUTES * 60 * 1000;
  const attendanceEndMs =
    attendanceStartMs + EVENT_ATTEND_DURATION_MINUTES * 60 * 1000;
  return events.filter((event) => {
    const startMs = Date.parse(event.start_time);
    const endMs = Date.parse(event.end_time);
    return (
      !Number.isNaN(startMs) &&
      !Number.isNaN(endMs) &&
      startMs <= attendanceStartMs &&
      endMs >= attendanceEndMs
    );
  });
}

function isValidCoordinate(location: {
  latitude: number;
  longitude: number;
}): boolean {
  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

export function scorePlace(
  place: CommunityPlanPlaceProjection,
  preference: NewResidentPreference,
  referenceLocation?: { latitude: number; longitude: number }
): number {
  let score = 0;
  const interestCategories = INTEREST_CATEGORY_MAP[preference.primary_interest];
  const interestIndex = interestCategories.indexOf(place.category_level_1);
  if (interestIndex >= 0) score += 36 - interestIndex * 8;

  if (
    ARRIVAL_CONTEXT_PRIORITY[preference.arrival_context].includes(
      place.category_level_1
    )
  ) {
    score += 8;
  }
  if (
    HOUSEHOLD_TYPE_PRIORITY[preference.household_type].includes(
      place.category_level_1
    )
  ) {
    score += 6;
  }
  if (place.is_recommended) score += 15;
  if (referenceLocation && isValidCoordinate(referenceLocation)) {
    score += Math.max(0, 10 - haversineKm(place.location, referenceLocation) * 5);
  }
  return score;
}

export function scoreEvent(
  event: CommunityPlanEventProjection,
  preference: NewResidentPreference,
  curatedEventId: string
): number {
  let score = event._id === curatedEventId ? 1000 : 0;
  if (preference.primary_interest === "social") score += 10;
  return score;
}

export function generateCommunityPlan(
  input: CommunityPlanEngineInput
): CommunityPlan {
  const validPlaces = filterPlaceCandidates(input.places);
  const validEvents = filterEventCandidates(input.events, input.now);
  const priorityCategories =
    INTEREST_CATEGORY_MAP[input.preference.primary_interest];
  const primaryCategory = priorityCategories.find((category) =>
    validPlaces.some((place) => place.category_level_1 === category)
  );
  const interestScopedPlaces = primaryCategory
    ? validPlaces.filter(
        (place) => place.category_level_1 === primaryCategory
      )
    : [];
  const selectedPlace = [...interestScopedPlaces]
    .map((place) => ({ place, score: scorePlace(place, input.preference) }))
    .sort(
      (left, right) =>
        right.score - left.score || left.place._id.localeCompare(right.place._id)
    )[0]?.place;
  const curatedEvent = validEvents.find(
    (event) => event._id === input.curatedEventId
  );

  if (!curatedEvent) {
    throw new Error(
      `Community Plan curated event is unavailable: ${input.curatedEventId}`
    );
  }
  if (!selectedPlace) {
    throw new Error(
      `Community Plan matcher could not produce a plan: no valid curated place for ${input.preference.primary_interest}`
    );
  }

  const generatedAt = input.generatedAt ?? input.now;
  const planId = input.planId ?? derivePlanId(input.preference, input.curatedEventId);
  return buildPlaceEventPlan(
    selectedPlace,
    curatedEvent,
    input.preference,
    planId,
    generatedAt
  );
}

function buildPlaceEventPlan(
  place: CommunityPlanPlaceProjection,
  event: CommunityPlanEventProjection,
  preference: NewResidentPreference,
  planId: string,
  generatedAt: string
): CommunityPlan {
  const placeNarration = getPlaceNarration(place.category_level_1);
  const eventNarration = getEventNarration();
  const interest = getInterestFeedback(preference.primary_interest);
  const arrival = getArrivalFeedback(preference.arrival_context);
  const household = getHouseholdFeedback(preference.household_type);
  const accessibility = getAccessibilityFeedback(preference.accessibility_need);
  const scenarioKey = buildCommunityPlanScenarioKey(preference);

  return CommunityPlanSchema.parse({
    plan_id: planId,
    community_id: "tongzilin",
    generated_at: generatedAt,
    scenario_key: scenarioKey,
    catalog_version: COMMUNITY_PLAN_CATALOG_VERSION,
    selection_explanation: {
      summary_zh: interest.summary_zh,
      summary_en: interest.summary_en,
      reasons: [
        {
          dimension: "primary_interest",
          text_zh: interest.reason_zh,
          text_en: interest.reason_en
        },
        {
          dimension: "arrival_context",
          text_zh: arrival.reason_zh,
          text_en: arrival.reason_en
        },
        {
          dimension: "household_type",
          text_zh: household.reason_zh,
          text_en: household.reason_en
        },
        {
          dimension: "accessibility_need",
          text_zh: accessibility.reason_zh,
          text_en: accessibility.reason_en
        }
      ]
    },
    items: [
      {
        item_id: "stop_place_001",
        ref_id: place._id,
        ref_type: "place",
        type: "place_visit",
        start_offset_minutes: 0,
        duration_minutes: PLACE_VISIT_DURATION_MINUTES,
        title_zh: place.name_zh,
        title_en: place.name_en,
        summary_zh: placeNarration.reason_zh,
        summary_en: placeNarration.reason_en,
        tips_zh: `${placeNarration.tips_zh}${accessibility.tip_zh}`,
        tips_en: `${placeNarration.tips_en} ${accessibility.tip_en}`,
        status: "pending",
        place
      },
      {
        item_id: "stop_event_001",
        ref_id: event._id,
        ref_type: "event",
        type: "event_attend",
        start_offset_minutes: PLACE_VISIT_DURATION_MINUTES,
        duration_minutes: EVENT_ATTEND_DURATION_MINUTES,
        title_zh: event.title_zh,
        title_en: event.title_en,
        summary_zh: eventNarration.reason_zh,
        summary_en: eventNarration.reason_en,
        tips_zh: `${eventNarration.tips_zh}${household.tip_zh}`,
        tips_en: `${eventNarration.tips_en} ${household.tip_en}`,
        status: "pending",
        event
      }
    ],
    total_duration_minutes: TARGET_TOTAL_MINUTES,
    route_kind: "place_event"
  });
}

export function projectPlace(
  place: CommunityPlanPlaceProjection
): CommunityPlanPlaceProjection {
  return {
    _id: place._id,
    name_zh: place.name_zh,
    name_en: place.name_en,
    cover_url: place.cover_url,
    category_level_1: place.category_level_1,
    is_recommended: place.is_recommended,
    location: {
      latitude: place.location.latitude,
      longitude: place.location.longitude
    }
  };
}

export function projectEvent(
  event: CommunityPlanEventProjection
): CommunityPlanEventProjection {
  return {
    _id: event._id,
    title_zh: event.title_zh,
    title_en: event.title_en,
    summary_zh: event.summary_zh,
    summary_en: event.summary_en,
    start_time: event.start_time,
    end_time: event.end_time,
    cover_url: event.cover_url
  };
}

function haversineKm(
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number }
): number {
  const radiusKm = 6371;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const leftLatitude = toRadians(left.latitude);
  const rightLatitude = toRadians(right.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLatitude) *
      Math.cos(rightLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * radiusKm * Math.asin(Math.sqrt(haversine));
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

function derivePlanId(
  preference: NewResidentPreference,
  curatedEventId: string
): string {
  const key = `${buildCommunityPlanScenarioKey(preference)}|${curatedEventId}`;
  let hash = 0;
  for (let index = 0; index < key.length; index++) {
    hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  }
  return `plan_${(hash >>> 0).toString(36)}`;
}

export type CommunityPlanScenarioAxes = {
  primary_interest: CommunityPlanInterest;
  arrival_context: CommunityPlanArrivalContext;
  household_type: CommunityPlanHouseholdType;
  accessibility_need: CommunityPlanAccessibilityNeed;
};
