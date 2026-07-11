import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
  auditBilingualContent,
  type ContentAuditInput
} from "./bilingual-content-audit";
import {
  applyBilingualBackfill,
  planBilingualBackfill
} from "./bilingual-content-migration";

const fixture = async <T>(name: string): Promise<T> =>
  JSON.parse(
    await readFile(
      new URL(`./fixtures/bilingual-content-audit/${name}`, import.meta.url),
      "utf8"
    )
  ) as T;

describe("bilingual production content audit", () => {
  it("passes a production-candidate-shaped export with complete provenance", async () => {
    const result = auditBilingualContent(
      await fixture<ContentAuditInput>("valid-production-candidate.json")
    );
    expect(result.summary).toEqual({ blocking: 0, editorial: 0, total: 0 });
    expect(result.contentPass).toBe(true);
    expect(result.releaseEligible).toBe(true);
    expect(result.counts).toEqual({
      events: 1,
      places: 1,
      announcements: 1,
      discoverPosts: 2
    });
  });

  it("labels valid fixtures as release-ineligible", async () => {
    const result = auditBilingualContent(
      await fixture<ContentAuditInput>("valid-fixture.json")
    );
    expect(result.contentPass).toBe(true);
    expect(result.releaseEligible).toBe(false);
    expect(result.releaseIneligibilityReason).toContain("Fixture evidence");
  });

  it("reports exact blocking and editorial issue paths without requiring UGC translations", async () => {
    const result = auditBilingualContent(
      await fixture<ContentAuditInput>("invalid-production-candidate.json")
    );
    expect(result.contentPass).toBe(false);
    expect(result.releaseEligible).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ classification: "blocking", code: "placeholder_copy", path: "events.0.title_en" }),
        expect.objectContaining({ classification: "blocking", code: "required_bilingual_field", path: "events.0.address_en" }),
        expect.objectContaining({ classification: "blocking", code: "draft_leakage", recordId: "event_invalid" }),
        expect.objectContaining({ classification: "blocking", code: "localhost_url", path: "events.0.cover_url" }),
        expect.objectContaining({ classification: "blocking", code: "fixture_url", path: "places.0.gallery_urls.0" }),
        expect.objectContaining({ classification: "blocking", code: "invalid_original_language", path: "discoverPosts.0.language" }),
        expect.objectContaining({ classification: "editorial", code: "media_attribution_required", path: "announcements.0.media_attribution" })
      ])
    );
    expect(result.issues.some((issue) => issue.path.includes("title_en") && issue.recordId === "post_invalid_language")).toBe(false);
  });

  it("blocks incomplete provenance and count mismatches", async () => {
    const input = await fixture<ContentAuditInput>("valid-fixture.json");
    input.provenance.source.query = "";
    input.provenance.recordCounts.events = 99;
    const result = auditBilingualContent(input);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "provenance_required", path: "provenance.source.query" }),
        expect.objectContaining({ code: "record_count_mismatch", path: "provenance.recordCounts.events" })
      ])
    );
  });

  it("does not treat an empty external gallery as media attribution", async () => {
    const input = await fixture<ContentAuditInput>(
      "valid-production-candidate.json"
    );
    const place = input.places?.[0];
    if (!place) {
      throw new Error("Expected a Place audit fixture.");
    }
    delete place.media_attribution;
    delete place.cover_source;
    place.external_gallery_media = [];

    const result = auditBilingualContent(input);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classification: "editorial",
          code: "media_attribution_required",
          path: "places.0.media_attribution",
          recordId: "place_prod_001"
        })
      ])
    );
  });
});

describe("review-gated bilingual backfill", () => {
  it("plans without mutation and never fabricates English editorial copy", async () => {
    const input = await fixture<Record<string, unknown>>("legacy-backfill.json");
    const before = structuredClone(input);
    const plan = planBilingualBackfill(input, "all");
    expect(input).toEqual(before);
    expect(plan.mutationPerformed).toBe(false);
    expect(plan.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: "events", recordId: "event_legacy", field: "address_zh", sourceField: "address_text" }),
        expect.objectContaining({ collection: "notifications", recordId: "notification_legacy_zh", field: "title_zh", sourceField: "title" })
      ])
    );
    expect(plan.actions.some((action) => action.field.endsWith("_en"))).toBe(false);
    expect(plan.editorialReview).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recordId: "event_legacy", reason: expect.stringContaining("address_en") }),
        expect.objectContaining({ recordId: "notification_unknown", reason: expect.stringContaining("unknown") })
      ])
    );
  });

  it("requires an approved dry-run digest and is idempotent", async () => {
    const input = await fixture<Record<string, unknown>>("legacy-backfill.json");
    const plan = planBilingualBackfill(input, "all");
    expect(() =>
      applyBilingualBackfill(input, { scope: "all", approvedPlanDigest: "wrong" })
    ).toThrow(/exact digest/);

    const first = applyBilingualBackfill(input, {
      scope: "all",
      approvedPlanDigest: plan.planDigest
    });
    const secondPlan = planBilingualBackfill(first.output, "all");
    expect(first.report.actionCount).toBeGreaterThan(0);
    expect(secondPlan.actionCount).toBe(0);
    expect((first.output.events as Array<Record<string, unknown>>)[0].address_en).toBe("");
    expect((first.output.notifications as Array<Record<string, unknown>>)[0].title_en).toBeNull();
  });

  it("scopes actions to the requested collection", async () => {
    const input = await fixture<Record<string, unknown>>("legacy-backfill.json");
    const plan = planBilingualBackfill(input, "events");
    expect(plan.actions.every((action) => action.collection === "events")).toBe(true);
  });
});
