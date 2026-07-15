import {
  CommunityPlanSchema,
  communityPlanCatalogBundle,
  generateJudgeScenarioPlan
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

const forbiddenKeyPattern =
  /(^|_)(api_?key|secret|secret_?key|token|credential|password|private_?key|cloudbase_?env|backend_?url|base_?url|map_?key)($|_)/i;
const forbiddenValuePatterns = [
  /cloud1-[a-z0-9-]+/i,
  /(?:localhost|127\.0\.0\.1):8787/i,
  /\/community-plan\/generate/i,
  /(?:tencent|amap).*(?:key|secret)/i
];

function inspectSerializedBundle(value: unknown, path = "$": string[] = []) {
  const violations: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      violations.push(...inspectSerializedBundle(entry, `${path}[${index}]`));
    });
    return violations;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key)) violations.push(`${path}.${key}`);
      violations.push(...inspectSerializedBundle(entry, `${path}.${key}`));
    }
    return violations;
  }
  if (
    typeof value === "string" &&
    forbiddenValuePatterns.some((pattern) => pattern.test(value))
  ) {
    violations.push(path);
  }
  return violations;
}

describe("R15 corrected evidence", () => {
  it("scans the serialized offline bundle and plan delivery boundary", () => {
    const serializedBundle = JSON.parse(JSON.stringify(communityPlanCatalogBundle));
    expect(inspectSerializedBundle(serializedBundle)).toEqual([]);

    const plan = generateJudgeScenarioPlan(0);
    expect(
      CommunityPlanSchema.safeParse({ ...plan, deliveryMode: "offline" }).success
    ).toBe(false);
  });
});
