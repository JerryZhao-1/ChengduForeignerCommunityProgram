import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";

const runDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(runDir, "../../..");
const logsDir = resolve(runDir, "logs");
const outputsDir = resolve(runDir, "outputs");
const reportPath = resolve(logsDir, "vitest.json");
const expectedResult = JSON.parse(
  readFileSync(resolve(runDir, "expected/result.json"), "utf8")
);
const expectedParity = JSON.parse(
  readFileSync(resolve(runDir, "expected/parity-summary.json"), "utf8")
);
mkdirSync(logsDir, { recursive: true });
mkdirSync(outputsDir, { recursive: true });

const logs = [];
const run = (command, args) => {
  try {
    const stdout = execFileSync(command, args, {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, npm_config_verify_deps_before_run: "false" }
    });
    logs.push(`--- ${command} ${args.join(" ")} ---\n${stdout}\n`);
    return { exit: 0 };
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}${error.message ?? ""}`;
    logs.push(`--- ${command} ${args.join(" ")} ---\n${output}\n`);
    return { exit: error.status ?? 1 };
  }
};

const typecheck = run("pnpm", ["--filter", "@community-map/mobile", "typecheck"]);
const lint = run(resolve(repoRoot, "node_modules/.bin/eslint"), [
  "apps/mobile/src/api/community-plan-adapter.spec.ts",
  "packages/shared/test/community-plans.spec.ts"
]);
rmSync(reportPath, { force: true });
const focusedTests = [
  "apps/mobile/src/api/community-plan-adapter.spec.ts",
  "apps/mobile/src/stores/onboarding-store.spec.ts",
  "packages/shared/test/community-plan-engine.spec.ts",
  "packages/shared/test/community-plans.spec.ts"
];
const vitest = run(resolve(repoRoot, "node_modules/.bin/vitest"), [
  "run",
  ...focusedTests,
  "--reporter=json",
  `--outputFile=${reportPath}`
]);

let report = null;
if (existsSync(reportPath)) {
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch {
    report = null;
  }
}
const statuses = new Map(
  (report?.testResults ?? []).flatMap((suite) =>
    suite.assertionResults.map((assertion) => [assertion.fullName, assertion.status])
  )
);
const requiredTests = [
  "community-plan adapter keeps API and local semantic fingerprints equal for all 576 preferences",
  "community-plan adapter labels mock-mode local matching as offline delivery",
  "community-plan adapter returns validation_error state for 400 VALIDATION_ERROR",
  "community-plan adapter keeps HTTP 403 as a localized API error without offline fallback",
  "community-plan adapter keeps HTTP 404 as a localized API error without offline fallback",
  "community-plan adapter keeps HTTP 409 as a localized API error without offline fallback",
  "community-plan adapter keeps HTTP 429 as a localized API error without offline fallback",
  "community-plan adapter falls back to the offline bundle on 5xx server errors",
  "community-plan adapter falls back to the offline bundle on transport/network failures",
  "community-plan adapter falls back to the offline bundle on transport error: getaddrinfo ENOTFOUND api.example.com",
  "community-plan adapter falls back to the offline bundle on transport error: timeout of 10000ms exceeded",
  "onboarding completion state requires a visited place and locally confirmed demo event",
  "community plan safe catalog bundle contains no production credentials or backend configuration"
];
const requiredTestResults = Object.fromEntries(
  requiredTests.map((name) => [name, statuses.get(name) ?? "missing"])
);
const passed = (name) => requiredTestResults[name] === "passed";
const parityTest =
  "community-plan adapter keeps API and local semantic fingerprints equal for all 576 preferences";
const safetyTest =
  "community plan safe catalog bundle contains no production credentials or backend configuration";
const bundleSafetyPassed = passed(safetyTest);
const paritySummary = {
  providerLocalParity: passed(parityTest) ? "576/576" : "unproven",
  totalScenarios: 576,
  mismatchedFingerprints: passed(parityTest) ? 0 : null,
  deliveryModeInsidePlan: bundleSafetyPassed ? false : null,
  fourXStaysApiError: [400, 403, 404, 409, 429].every((status) =>
    status === 400
      ? passed("community-plan adapter returns validation_error state for 400 VALIDATION_ERROR")
      : passed(
          `community-plan adapter keeps HTTP ${status} as a localized API error without offline fallback`
        )
  ),
  transportAndFiveXFallback:
    passed("community-plan adapter falls back to the offline bundle on 5xx server errors") &&
    passed("community-plan adapter falls back to the offline bundle on transport/network failures") &&
    passed(
      "community-plan adapter falls back to the offline bundle on transport error: getaddrinfo ENOTFOUND api.example.com"
    ) &&
    passed(
      "community-plan adapter falls back to the offline bundle on transport error: timeout of 10000ms exceeded"
    ),
  offlineCompletesRoute: passed(
    "onboarding completion state requires a visited place and locally confirmed demo event"
  ),
  bundleHasNoProductionSecrets: bundleSafetyPassed
};
const actual = {
  typecheckExit: typecheck.exit,
  lintExit: lint.exit,
  vitestExit: vitest.exit,
  failedTests: report?.numFailedTests ?? null,
  requiredTestsPassed: Object.values(requiredTestResults).every(
    (status) => status === "passed"
  ),
  bundleSafetyPassed
};
const resultExpectedMatches = isDeepStrictEqual(actual, expectedResult);
const parityExpectedMatches = isDeepStrictEqual(paritySummary, expectedParity);
const finalDecision =
  resultExpectedMatches && parityExpectedMatches ? "pass" : "fail";
const result = {
  change: "launch-trae-competition-h5-demo",
  task: "15.1",
  ref: "R15",
  scope: "CLI",
  actual,
  expected: expectedResult,
  resultExpectedMatches,
  parityExpectedMatches,
  requiredTestResults,
  finalDecision
};
logs.push(`--- summary ---\n${JSON.stringify(result, null, 2)}\n`);
writeFileSync(resolve(logsDir, "run.log"), logs.join("\n"));
writeFileSync(resolve(outputsDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(
  resolve(outputsDir, "parity-summary.json"),
  `${JSON.stringify(paritySummary, null, 2)}\n`
);
console.log(
  `finalDecision=${finalDecision} resultExpectedMatches=${resultExpectedMatches} parityExpectedMatches=${parityExpectedMatches}`
);
process.exit(finalDecision === "pass" ? 0 : 1);
