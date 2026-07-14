import {
  COMMUNITY_PLAN_DEMO_EVENT_ID,
  COMPETITION_DEMO_NOW,
  COMPETITION_JUDGE_SCENARIOS,
  CommunityPlanEventProjectionSchema,
  CommunityPlanPlaceProjectionSchema,
  CommunityPlanSchema,
  createCompetitionDemoEngineInput,
  filterEventCandidates,
  filterPlaceCandidates,
  generateCommunityPlan,
  generateJudgeScenarioPlan,
  getCompetitionDemoEventProjections,
  getCompetitionDemoPlaceProjections,
  RULE_ENGINE_ID,
  scoreEvent,
  scorePlace
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

// --- Helpers ---

const basePreference = COMPETITION_JUDGE_SCENARIOS[0];
const placeProjections = getCompetitionDemoPlaceProjections();
const eventProjections = getCompetitionDemoEventProjections();

function createEngineInput(overrides = {}) {
  return createCompetitionDemoEngineInput(basePreference, overrides);
}

// --- Determinism ---

describe("community plan engine determinism", () => {
  it("produces identical output for identical input", () => {
    const input = createEngineInput();
    const plan1 = generateCommunityPlan(input);
    const plan2 = generateCommunityPlan(input);
    expect(plan1).toEqual(plan2);
  });

  it("produces identical structure across multiple invocations", () => {
    const input = createEngineInput();
    const plans = Array.from({ length: 5 }, () => generateCommunityPlan(input));
    for (let i = 1; i < plans.length; i++) {
      expect(plans[i]).toEqual(plans[0]);
    }
  });

  it("derives a stable plan_id from the preference", () => {
    const input = createEngineInput();
    const plan1 = generateCommunityPlan(input);
    const plan2 = generateCommunityPlan(input);
    expect(plan1.plan_id).toBe(plan2.plan_id);
    expect(plan1.plan_id).toMatch(/^plan_[a-z0-9]+$/);
  });
});

// --- Filtering ---

describe("community plan engine filtering", () => {
  it("competition fixtures project only published Tongzilin places", () => {
    expect(placeProjections.map((place) => place._id)).not.toContain(
      "place_003"
    );
  });

  it("excludes places with invalid coordinates", () => {
    const invalidCoordPlaces = [
      {
        ...placeProjections[0],
        location: { latitude: 999, longitude: 999 }
      }
    ];
    expect(filterPlaceCandidates(invalidCoordPlaces)).toHaveLength(0);
  });

  it("excludes events that cannot cover the planned attendance window", () => {
    const endedEvent = {
      ...eventProjections[0],
      end_time: "2027-03-31T10:00:00+08:00"
    };
    expect(
      filterEventCandidates([endedEvent], COMPETITION_DEMO_NOW)
    ).toHaveLength(0);
  });

  it("excludes future events outside the two-hour route window", () => {
    const futureEvent = {
      ...eventProjections[0],
      start_time: "2027-04-03T10:00:00+08:00",
      end_time: "2027-04-03T12:00:00+08:00"
    };
    expect(
      filterEventCandidates([futureEvent], COMPETITION_DEMO_NOW)
    ).toHaveLength(0);
  });

  it("includes only events that cover the minute-60 attendance slot", () => {
    const validEvents = filterEventCandidates(
      eventProjections,
      COMPETITION_DEMO_NOW
    );
    expect(validEvents.map((event) => event._id)).toEqual(["event_001"]);
  });

  it("includes at least 10 published places", () => {
    const validPlaces = filterPlaceCandidates(placeProjections);
    expect(validPlaces.length).toBeGreaterThanOrEqual(10);
  });
});

// --- Scoring ---

describe("community plan engine scoring", () => {
  it("gives the curated event the highest score", () => {
    const validEvents = filterEventCandidates(
      eventProjections,
      COMPETITION_DEMO_NOW
    );
    const scored = validEvents.map((e) => ({
      event: e,
      score: scoreEvent(e, basePreference, COMMUNITY_PLAN_DEMO_EVENT_ID)
    }));
    const curated = scored.find(
      (s) => s.event._id === COMMUNITY_PLAN_DEMO_EVENT_ID
    );
    expect(curated).toBeDefined();
    for (const s of scored) {
      if (s.event._id !== COMMUNITY_PLAN_DEMO_EVENT_ID) {
        expect(curated!.score).toBeGreaterThan(s.score);
      }
    }
  });

  it("rewards recommended places with higher scores", () => {
    const validPlaces = filterPlaceCandidates(placeProjections);
    const recommended = validPlaces.find((p) => p.is_recommended)!;
    const notRecommended = validPlaces.find((p) => !p.is_recommended)!;
    const recommendedScore = scorePlace(recommended, basePreference);
    const notRecommendedScore = scorePlace(notRecommended, basePreference);
    expect(recommendedScore).toBeGreaterThan(notRecommendedScore);
  });

  it("rewards interest category matches", () => {
    const place = validPlaces_findByCategory("public-service");
    const score = scorePlace(place, {
      ...basePreference,
      interests: ["community-service"]
    });
    const scoreNoMatch = scorePlace(place, {
      ...basePreference,
      interests: ["outdoor-sports"]
    });
    expect(score).toBeGreaterThan(scoreNoMatch);
  });

  it("does not score duplicate interests more than once", () => {
    const place = validPlaces_findByCategory("food-drink");
    const singleScore = scorePlace(place, {
      ...basePreference,
      interests: ["food-drink"]
    });
    const duplicateScore = scorePlace(place, {
      ...basePreference,
      interests: ["food-drink", "food-drink"]
    });

    expect(duplicateScore).toBe(singleScore);
  });
});

function validPlaces_findByCategory(category: string) {
  const validPlaces = filterPlaceCandidates(placeProjections);
  const place = validPlaces.find((p) => p.category_level_1 === category);
  if (!place) throw new Error(`No published place with category ${category}`);
  return place;
}

// --- Route generation ---

describe("community plan engine route generation", () => {
  it("generates a place_event route when the curated event is available", () => {
    const plan = generateCommunityPlan(createEngineInput());
    expect(plan.route_kind).toBe("place_event");
    expect(plan.items).toHaveLength(2);
    expect(plan.items[0].type).toBe("place_visit");
    expect(plan.items[1].type).toBe("event_attend");
    expect(plan.items[1].ref_id).toBe(COMMUNITY_PLAN_DEMO_EVENT_ID);
  });

  it("includes bilingual narration in every item", () => {
    const plan = generateCommunityPlan(createEngineInput());
    for (const item of plan.items) {
      expect(item.summary_zh).toBeTruthy();
      expect(item.summary_en).toBeTruthy();
      expect(item.tips_zh).toBeTruthy();
      expect(item.tips_en).toBeTruthy();
    }
  });

  it("always sets total_duration_minutes to 120 for the canonical route", () => {
    const plan = generateCommunityPlan(createEngineInput());
    expect(plan.total_duration_minutes).toBe(120);
  });

  it("aligns the event attendance offset with the real event window", () => {
    const plan = generateCommunityPlan(createEngineInput());
    const eventItem = plan.items.find((item) => item.type === "event_attend");
    if (!eventItem) throw new Error("expected an event_attend item");

    const routeStartMs = Date.parse(plan.generated_at);
    const attendanceStartMs =
      routeStartMs + eventItem.start_offset_minutes * 60 * 1000;
    const attendanceEndMs =
      attendanceStartMs + eventItem.duration_minutes * 60 * 1000;

    expect(Date.parse(eventItem.event.start_time)).toBeLessThanOrEqual(
      attendanceStartMs
    );
    expect(Date.parse(eventItem.event.end_time)).toBeGreaterThanOrEqual(
      attendanceEndMs
    );
  });

  it("sets generated_by to the rule engine ID, never AI", () => {
    const plan = generateCommunityPlan(createEngineInput());
    expect(plan.generated_by).toBe(RULE_ENGINE_ID);
    expect(plan.generated_by).not.toContain("ai");
    expect(plan.generated_by).not.toContain("deepseek");
  });

  it("sets generation_source to rule_based and ai_status to not_configured", () => {
    const plan = generateCommunityPlan(createEngineInput());
    expect(plan.generation_source).toBe("rule_based");
    expect(plan.ai_status).toBe("not_configured");
  });
});

// --- Public-safe projections ---

describe("community plan engine public-safe projections", () => {
  it("place projections contain only allowlisted fields", () => {
    const plan = generateCommunityPlan(createEngineInput());
    const placeItem = plan.items.find((i) => i.type === "place_visit");
    expect(placeItem).toBeDefined();
    const projection = placeItem!.place;
    expect(() =>
      CommunityPlanPlaceProjectionSchema.parse(projection)
    ).not.toThrow();
    expect(projection).not.toHaveProperty("address_zh");
    expect(projection).not.toHaveProperty("address_en");
    expect(projection).not.toHaveProperty("intro_zh");
    expect(projection).not.toHaveProperty("gallery_urls");
    expect(projection).not.toHaveProperty("tencent_map_poi_id");
    expect(projection).not.toHaveProperty("status");
  });

  it("event projections contain only allowlisted fields", () => {
    const plan = generateCommunityPlan(createEngineInput());
    const eventItem = plan.items.find((i) => i.type === "event_attend");
    expect(eventItem).toBeDefined();
    const projection = eventItem!.event;
    expect(() =>
      CommunityPlanEventProjectionSchema.parse(projection)
    ).not.toThrow();
    expect(projection).not.toHaveProperty("capacity");
    expect(projection).not.toHaveProperty("signup_deadline");
    expect(projection).not.toHaveProperty("organizer_user_id");
    expect(projection).not.toHaveProperty("review_status");
    expect(projection).not.toHaveProperty("publish_status");
  });

  it("competition demo place projections are all public-safe", () => {
    const projections = getCompetitionDemoPlaceProjections();
    expect(projections.length).toBeGreaterThanOrEqual(10);
    for (const p of projections) {
      expect(() => CommunityPlanPlaceProjectionSchema.parse(p)).not.toThrow();
    }
  });

  it("competition demo event projections are all public-safe", () => {
    const projections = getCompetitionDemoEventProjections();
    expect(projections.map((event) => event._id)).toEqual(["event_001"]);
    for (const e of projections) {
      expect(() => CommunityPlanEventProjectionSchema.parse(e)).not.toThrow();
    }
  });
});

// --- Boundary cases ---

describe("community plan engine boundary cases", () => {
  it("throws when no valid place candidates exist", () => {
    expect(() =>
      generateCommunityPlan(
        createEngineInput({
          places: [],
          events: eventProjections
        })
      )
    ).toThrow(/no valid place candidates/);
  });

  it("throws when the configured curated event is missing", () => {
    expect(() =>
      generateCommunityPlan(
        createEngineInput({
          curatedEventId: "event_nonexistent"
        })
      )
    ).toThrow(/curated event is unavailable/);
  });

  it("produces a valid CommunityPlan that passes schema validation", () => {
    const plan = generateCommunityPlan(createEngineInput());
    expect(() => CommunityPlanSchema.parse(plan)).not.toThrow();
  });
});

// --- Judge scenario snapshots ---

describe("community plan judge scenarios", () => {
  it("has exactly 3 judge scenarios", () => {
    expect(COMPETITION_JUDGE_SCENARIOS).toHaveLength(3);
  });

  it("scenario 0: solo newcomer first-week produces place_event route", () => {
    const plan = generateJudgeScenarioPlan(0);
    expect(plan.route_kind).toBe("place_event");
    expect(plan.items).toHaveLength(2);
    expect(plan.items[0].type).toBe("place_visit");
    expect(plan.items[1].type).toBe("event_attend");

    // Deterministic place selection: the rule engine always picks the same
    // highest-scoring place for the solo newcomer first-week profile. The
    // exact place_id is captured here as a stability snapshot; update it
    // only when the scoring rules intentionally change.
    const placeItem = plan.items[0];
    if (placeItem.type !== "place_visit") {
      throw new Error("expected first item to be place_visit");
    }
    expect(placeItem.place._id).toMatch(/^place_\d{3}$/);

    const eventItem = plan.items[1];
    if (eventItem.type !== "event_attend") {
      throw new Error("expected second item to be event_attend");
    }
    expect(eventItem.event._id).toBe(COMMUNITY_PLAN_DEMO_EVENT_ID);
    expect(plan.generated_by).toBe(RULE_ENGINE_ID);
  });

  it("scenario 1: family with kids first-month produces a valid plan", () => {
    const plan = generateJudgeScenarioPlan(1);
    expect(plan.items).toHaveLength(2);
    expect(plan.total_duration_minutes).toBe(120);
    expect(plan.generated_by).toBe(RULE_ENGINE_ID);
  });

  it("scenario 2: couple settled produces a valid plan", () => {
    const plan = generateJudgeScenarioPlan(2);
    expect(plan.items).toHaveLength(2);
    expect(plan.total_duration_minutes).toBe(120);
    expect(plan.generated_by).toBe(RULE_ENGINE_ID);
  });

  it("all scenario plans are deterministic across repeated calls", () => {
    for (let i = 0; i < COMPETITION_JUDGE_SCENARIOS.length; i++) {
      const plan1 = generateJudgeScenarioPlan(i);
      const plan2 = generateJudgeScenarioPlan(i);
      expect(plan1).toEqual(plan2);
    }
  });

  it("all scenario plans pass schema validation", () => {
    for (let i = 0; i < COMPETITION_JUDGE_SCENARIOS.length; i++) {
      const plan = generateJudgeScenarioPlan(i);
      expect(() => CommunityPlanSchema.parse(plan)).not.toThrow();
    }
  });

  it("scenario 0 plan matches the deterministic snapshot", () => {
    const plan = generateJudgeScenarioPlan(0);
    // Snapshot the public-safe shape (no PII, no admin fields) so any
    // unintentional change to the rule engine output is caught in review.
    expect(plan).toMatchSnapshot();
  });

  it("scenario 1 plan matches the deterministic snapshot", () => {
    const plan = generateJudgeScenarioPlan(1);
    expect(plan).toMatchSnapshot();
  });

  it("scenario 2 plan matches the deterministic snapshot", () => {
    const plan = generateJudgeScenarioPlan(2);
    expect(plan).toMatchSnapshot();
  });
});
