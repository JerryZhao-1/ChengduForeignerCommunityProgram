import { describe, expect, it } from "vitest";

import {
  buildCompetitionDemoEvents,
  buildCompetitionDemoPlaces,
  buildCompetitionDemoPosts,
  buildCompetitionDemoUsers,
  type CompetitionDemoReferenceIds
} from "./competition-demo-content";

const assetBaseUrl = "https://preview.example.test";
const referenceIds: CompetitionDemoReferenceIds = {
  places: {
    "newcomer-hub": "place_demo_newcomer",
    "community-living-room": "place_demo_living_room",
    "family-reading-corner": "place_demo_reading",
    "community-tool-station": "place_demo_tools"
  },
  events: {
    "newcomer-walk": "event_demo_walk",
    "bilingual-tea": "event_demo_tea",
    "map-workshop": "event_demo_workshop"
  }
};

describe("competition demo content", () => {
  it("builds five non-login demo users with distinct identities", () => {
    const users = buildCompetitionDemoUsers(assetBaseUrl);

    expect(users).toHaveLength(5);
    expect(new Set(users.map((user) => user._id)).size).toBe(5);
    expect(new Set(users.map((user) => user.nickname)).size).toBe(5);
    expect(users.every((user) => user._id.startsWith("demo_user_"))).toBe(true);
    expect(users.every((user) => !("openid" in user))).toBe(true);
    expect(users.every((user) => !("phone" in user))).toBe(true);
  });

  it("builds four non-navigable community service places", () => {
    const places = buildCompetitionDemoPlaces(assetBaseUrl);

    expect(places).toHaveLength(4);
    expect(places.every((place) => place.status === "published")).toBe(true);
    expect(places.every((place) => place.supports_navigation === false)).toBe(
      true
    );
    expect(places.every((place) => place.tencent_map_poi_id === null)).toBe(
      true
    );
  });

  it("builds three bilingual future events with valid place references", () => {
    const events = buildCompetitionDemoEvents(assetBaseUrl, referenceIds.places);

    expect(events).toHaveLength(3);
    expect(events.map((event) => event.capacity)).toEqual([30, 24, 20]);
    expect(events.every((event) => !!event.title_zh && !!event.title_en)).toBe(
      true
    );
    expect(
      events.every((event) =>
        Object.values(referenceIds.places).includes(event.place_id ?? "")
      )
    ).toBe(true);
  });

  it("builds ten visible posts across all five users with resolved references", () => {
    const posts = buildCompetitionDemoPosts({
      assetBaseUrl,
      referenceIds,
      createdAt: "2026-07-16T00:00:00.000Z"
    });

    expect(posts).toHaveLength(10);
    expect(new Set(posts.map((post) => post._id)).size).toBe(10);
    expect(new Set(posts.map((post) => post.author_user_id)).size).toBe(5);
    expect(posts.every((post) => post.status === "visible")).toBe(true);
    expect(posts.every((post) => post.review_status === "visible")).toBe(true);
    expect(
      posts.every(
        (post) =>
          post.place_id === null ||
          Object.values(referenceIds.places).includes(post.place_id)
      )
    ).toBe(true);
    expect(
      posts.every(
        (post) =>
          post.event_id === null ||
          Object.values(referenceIds.events).includes(post.event_id)
      )
    ).toBe(true);
  });
});
