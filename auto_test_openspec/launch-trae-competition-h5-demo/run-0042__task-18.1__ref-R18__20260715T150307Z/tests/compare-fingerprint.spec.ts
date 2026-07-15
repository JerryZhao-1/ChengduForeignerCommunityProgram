import { readFileSync, writeFileSync } from "node:fs";

import {
  CommunityPlanSchema,
  createCompetitionDemoEngineInput,
  generateCommunityPlan
} from "../../../../packages/shared/src/index";
import { expect, test } from "vitest";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

test("production API and local matcher have identical semantic fingerprints", () => {
  const inputPath = process.env.R18_API_RESPONSE;
  const outputPath = process.env.R18_FINGERPRINT_OUTPUT;
  if (!inputPath || !outputPath) throw new Error("R18 evidence paths are required.");

  const rawEnvelope: unknown = JSON.parse(readFileSync(inputPath, "utf8"));
  if (!isRecord(rawEnvelope) || rawEnvelope.success !== true) {
    throw new Error("Expected a successful API envelope.");
  }
  const apiPlan = CommunityPlanSchema.parse(rawEnvelope.data);

  const preference = {
    preferred_language: "zh" as const,
    primary_interest: "community-service" as const,
    arrival_context: "first-week" as const,
    household_type: "solo" as const,
    accessibility_need: "none" as const
  };
  const local = generateCommunityPlan(createCompetitionDemoEngineInput(preference));
  const fingerprint = (plan: typeof local) => ({
    scenario_key: plan.scenario_key,
    catalog_version: plan.catalog_version,
    refs: plan.items.map((item) => item.ref_id),
    reasons: plan.selection_explanation.reasons.map((reason) => ({
      dimension: reason.dimension,
      text_zh: reason.text_zh,
      text_en: reason.text_en
    }))
  });
  const apiFingerprint = fingerprint(apiPlan);
  const localFingerprint = fingerprint(local);
  const equal = JSON.stringify(apiFingerprint) === JSON.stringify(localFingerprint);

  writeFileSync(
    outputPath,
    `${JSON.stringify({ equal, api: apiFingerprint, local: localFingerprint }, null, 2)}\n`,
    "utf8"
  );
  expect(apiFingerprint).toEqual(localFingerprint);
});
