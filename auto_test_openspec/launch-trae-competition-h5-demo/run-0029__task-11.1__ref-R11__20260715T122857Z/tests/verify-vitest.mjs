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
const expected = JSON.parse(
  readFileSync(resolve(runDir, "expected/result.json"), "utf8")
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
    return { exit: 0, output: stdout };
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}${error.message ?? ""}`;
    logs.push(`--- ${command} ${args.join(" ")} ---\n${output}\n`);
    return { exit: error.status ?? 1, output };
  }
};

const typecheck = run("pnpm", ["--filter", "@community-map/shared", "typecheck"]);
const lint = run(resolve(repoRoot, "node_modules/.bin/eslint"), [
  "packages/shared/test/community-plans.spec.ts",
  resolve(runDir, "tests/evidence-assertions.spec.ts")
]);
rmSync(reportPath, { force: true });
const focusedTests = [
  "packages/shared/test/community-plans.spec.ts",
  "packages/shared/test/community-plan-engine.spec.ts",
  "packages/shared/test/contracts.spec.ts",
  "packages/shared/test/client.spec.ts",
  resolve(runDir, "tests/evidence-assertions.spec.ts")
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
const assertionStatuses = new Map(
  (report?.testResults ?? []).flatMap((suite) =>
    suite.assertionResults.map((assertion) => [assertion.fullName, assertion.status])
  )
);
const requiredTests = [
  "community plan singular preference rejects missing required fields",
  "community plan singular preference rejects array values on singular preference fields",
  "community plan singular preference rejects legacy arrays, unknown fields, community_id, PII, and free text",
  "community plan explainable response rejects missing or reordered explanation reasons",
  "community plan explainable response rejects legacy model-result fields including model and prompt",
  "community plan safe catalog bundle rejects unsafe place and event projection fields",
  "community plan contract surface exposes only POST generation",
  "community plan contract surface exposes only generate on the mock client communityPlan surface",
  "R11 corrected evidence derives the singular contract and minimal client surface"
];
const requiredTestResults = Object.fromEntries(
  requiredTests.map((name) => [name, assertionStatuses.get(name) ?? "missing"])
);
const requiredTestsPassed = Object.values(requiredTestResults).every(
  (status) => status === "passed"
);
const contractEvidencePassed =
  requiredTestResults[
    "R11 corrected evidence derives the singular contract and minimal client surface"
  ] === "passed";
const actual = {
  typecheckExit: typecheck.exit,
  lintExit: lint.exit,
  vitestExit: vitest.exit,
  failedTests: report?.numFailedTests ?? null,
  requiredTestsPassed,
  contractEvidencePassed
};
const expectedMatches = isDeepStrictEqual(actual, expected);
const finalDecision = expectedMatches ? "pass" : "fail";
const result = {
  change: "launch-trae-competition-h5-demo",
  task: "11.1",
  ref: "R11",
  scope: "CLI",
  baselineHead: "e15efde43ad0eb3c3c6317ee32a6c7309fd2d110",
  actual,
  expected,
  expectedMatches,
  requiredTestResults,
  finalDecision
};
logs.push(`--- summary ---\n${JSON.stringify(result, null, 2)}\n`);
writeFileSync(resolve(logsDir, "run.log"), logs.join("\n"));
writeFileSync(resolve(outputsDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`finalDecision=${finalDecision} expectedMatches=${expectedMatches}`);
process.exit(finalDecision === "pass" ? 0 : 1);
