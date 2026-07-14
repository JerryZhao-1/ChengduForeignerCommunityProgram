import type {
  CommunityPlan,
  CommunityPlanEventProjection,
  CommunityPlanPlaceProjection,
  NewResidentPreference
} from "../types/entities";
import { CommunityPlanSchema } from "../schemas/community-plans";
import {
  ARRIVAL_CONTEXT_PRIORITY,
  HOUSEHOLD_TYPE_PRIORITY,
  INTEREST_CATEGORY_MAP,
  getEventNarration,
  getPlaceNarration
} from "./narration";

/**
 * Identifies the generator that produced a Community Plan. The rule engine
 * always sets this to RULE_ENGINE_ID; the API layer may overwrite it with
 * AI_GENERATOR_ID when DeepSeek narration is successfully merged. Fallback
 * paths keep the rule-engine ID so the source is never misattributed.
 */
export const RULE_ENGINE_ID = "tongzilin-rule-engine-v1";
export const AI_GENERATOR_ID = "tongzilin-ai-deepseek-v1";
export const RULE_ENGINE_FALLBACK_ID = "tongzilin-rule-engine-v1-fallback";

/**
 * Fixed duration for the canonical place_visit stop in a place_event route.
 */
const PLACE_VISIT_DURATION_MINUTES = 60;
/**
 * Fixed duration for the curated event_attend stop in a place_event route.
 */
const EVENT_ATTEND_DURATION_MINUTES = 60;
/**
 * Total target duration for the First 120 Minutes route.
 */
const TARGET_TOTAL_MINUTES = 120;

export interface CommunityPlanEngineInput {
  preference: NewResidentPreference;
  places: CommunityPlanPlaceProjection[];
  events: CommunityPlanEventProjection[];
  curatedEventId: string;
  /**
   * ISO timestamp used for deterministic event filtering (signup deadline,
   * ended check). The engine never calls Date.now() so identical inputs
   * always produce identical outputs.
   */
  now: string;
  /**
   * Optional deterministic plan_id. Defaults to a stable hash-derived ID.
   */
  planId?: string;
  /**
   * Optional deterministic generated_at timestamp. Defaults to the input
   * `now` value.
   */
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

/**
 * Rejects malformed public-safe place candidates. Publication and community
 * filtering belongs to the provider before it creates this projection.
 */
export function filterPlaceCandidates(
  places: CommunityPlanPlaceProjection[]
): CommunityPlanPlaceProjection[] {
  return places.filter((place) => {
    if (!isValidCoordinate(place.location)) return false;
    return true;
  });
}

/**
 * Keeps public-safe event candidates that cover the complete minute-60 to
 * minute-120 attendance slot. Publication and community filtering belongs to
 * the provider before it creates this projection. The MVP deliberately does
 * not inspect registration or capacity state.
 */
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
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false;

    return startMs <= attendanceStartMs && endMs >= attendanceEndMs;
  });
}

function isValidCoordinate(location: {
  latitude: number;
  longitude: number;
}): boolean {
  return (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

/**
 * Scores a place candidate by interests, arrival context, household type,
 * recommendation status, and walking distance from a reference point.
 * Higher score is better. Ties are broken by _id for deterministic ordering.
 */
export function scorePlace(
  place: CommunityPlanPlaceProjection,
  preference: NewResidentPreference,
  referenceLocation?: { latitude: number; longitude: number }
): number {
  let score = 0;

  // Interest match: +12 per matched interest category
  for (const interest of new Set(preference.interests)) {
    const categories = INTEREST_CATEGORY_MAP[interest];
    if (categories.includes(place.category_level_1)) {
      score += 12;
    }
  }

  // Arrival context priority: +8 if category is in priority list
  const arrivalPriority = ARRIVAL_CONTEXT_PRIORITY[preference.arrival_context];
  if (arrivalPriority.includes(place.category_level_1)) {
    score += 8;
  }

  // Household type priority: +6 if category matches
  const householdPriority = HOUSEHOLD_TYPE_PRIORITY[preference.household_type];
  if (householdPriority.includes(place.category_level_1)) {
    score += 6;
  }

  // Recommendation status: +15 if recommended. Lower rank number means a
  // stronger recommendation (rank 1 = highest), so we reward low ranks with
  // up to +5 extra points.
  if (place.is_recommended) {
    score += 15;
  }

  // Walking distance: closer to reference = higher score (max +10)
  if (referenceLocation && isValidCoordinate(referenceLocation)) {
    const distanceKm = haversineKm(place.location, referenceLocation);
    // 0 km → +10, 2+ km → +0
    score += Math.max(0, 10 - distanceKm * 5);
  }

  return score;
}

/**
 * Scores an event candidate. The curated demo event receives a fixed bonus
 * so it is always selected when available, satisfying the release fixture
 * requirement.
 */
export function scoreEvent(
  event: CommunityPlanEventProjection,
  preference: NewResidentPreference,
  curatedEventId: string
): number {
  let score = 0;

  // Curated event always wins
  if (event._id === curatedEventId) {
    score += 1000;
  }

  // Social interest boost
  if (preference.interests.includes("social")) {
    score += 10;
  }

  return score;
}

/**
 * Deterministically sorts scored candidates by score descending, then by
 * _id ascending for stable tie-breaking.
 */
function sortScored<
  T extends {
    score: number;
    place?: CommunityPlanPlaceProjection;
    event?: CommunityPlanEventProjection;
  }
>(scored: T[], getId: (item: T) => string): T[] {
  return [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return getId(a).localeCompare(getId(b));
  });
}

/**
 * Generates a deterministic Community Plan from public candidates.
 *
 * Produces exactly one place plus the configured curated event. Missing
 * release fixtures are configuration failures rather than alternate routes.
 * - Same inputs always produce identical outputs.
 */
export function generateCommunityPlan(
  input: CommunityPlanEngineInput
): CommunityPlan {
  const validPlaces = filterPlaceCandidates(input.places);
  const validEvents = filterEventCandidates(input.events, input.now);

  // Score and sort places
  const scoredPlaces: ScoredPlace[] = validPlaces.map((place) => ({
    place,
    score: scorePlace(place, input.preference)
  }));
  const sortedPlaces = sortScored(scoredPlaces, (item) => item.place._id);

  // Find the curated event among valid events
  const curatedEvent = validEvents.find(
    (event) => event._id === input.curatedEventId
  );

  const generatedAt = input.generatedAt ?? input.now;
  const planId = input.planId ?? derivePlanId(input);

  if (!curatedEvent) {
    throw new Error(
      `Community Plan curated event is unavailable: ${input.curatedEventId}`
    );
  }

  if (sortedPlaces.length === 0) {
    throw new Error(
      "Community Plan engine could not produce a plan: no valid place candidates"
    );
  }

  return buildPlaceEventPlan(
    sortedPlaces[0].place,
    curatedEvent,
    planId,
    generatedAt
  );
}

function buildPlaceEventPlan(
  place: CommunityPlanPlaceProjection,
  event: CommunityPlanEventProjection,
  planId: string,
  generatedAt: string
): CommunityPlan {
  const placeNarration = getPlaceNarration(place.category_level_1);
  const eventNarration = getEventNarration();

  const plan = {
    plan_id: planId,
    community_id: "tongzilin" as const,
    generated_at: generatedAt,
    items: [
      {
        item_id: "stop_place_001",
        ref_id: place._id,
        ref_type: "place" as const,
        type: "place_visit" as const,
        start_offset_minutes: 0,
        duration_minutes: PLACE_VISIT_DURATION_MINUTES,
        title_zh: place.name_zh,
        title_en: place.name_en,
        summary_zh: placeNarration.reason_zh,
        summary_en: placeNarration.reason_en,
        tips_zh: placeNarration.tips_zh,
        tips_en: placeNarration.tips_en,
        status: "pending" as const,
        place
      },
      {
        item_id: "stop_event_001",
        ref_id: event._id,
        ref_type: "event" as const,
        type: "event_attend" as const,
        start_offset_minutes: PLACE_VISIT_DURATION_MINUTES,
        duration_minutes: EVENT_ATTEND_DURATION_MINUTES,
        title_zh: event.title_zh,
        title_en: event.title_en,
        summary_zh: eventNarration.reason_zh,
        summary_en: eventNarration.reason_en,
        tips_zh: eventNarration.tips_zh,
        tips_en: eventNarration.tips_en,
        status: "pending" as const,
        event
      }
    ],
    total_duration_minutes: TARGET_TOTAL_MINUTES,
    route_kind: "place_event" as const,
    generation_source: "rule_based" as const,
    ai_status: "not_configured" as const,
    generated_by: RULE_ENGINE_ID
  };

  return CommunityPlanSchema.parse(plan);
}

/**
 * Projects a full Place entity to the public-safe Community Plan projection.
 * Only allowlisted marker-safe fields are included.
 */
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

/**
 * Projects a full Event entity to the public-safe Community Plan projection.
 * Only allowlisted public display fields are included.
 */
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

/**
 * Haversine distance in kilometers between two coordinates.
 */
function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Derives a deterministic plan_id from the preference and curated event.
 * Same inputs always produce the same ID.
 */
function derivePlanId(input: CommunityPlanEngineInput): string {
  const interestKey = [...input.preference.interests].sort().join(",");
  const key = [
    input.preference.preferred_language,
    interestKey,
    input.preference.arrival_context,
    input.preference.household_type,
    input.curatedEventId
  ].join("|");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `plan_${(hash >>> 0).toString(36)}`;
}
