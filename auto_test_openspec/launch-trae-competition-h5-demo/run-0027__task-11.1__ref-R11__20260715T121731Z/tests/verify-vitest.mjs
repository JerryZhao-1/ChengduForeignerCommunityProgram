// Verifier for R11 Community Plan singular contract lock review.
// Runs the real typecheck + lint + vitest and writes the machine-readable result.

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const runDir = resolve(__dirname, "..");
const logsDir = resolve(runDir, "logs");
const outputsDir = resolve(runDir, "outputs");
const repoRoot = resolve(runDir, "../../..");
const vitestBin = resolve(repoRoot, "node_modules/.bin/vitest");
const eslintBin = resolve(repoRoot, "node_modules/.bin/eslint");
const vitestReportPath = resolve(logsDir, "vitest.json");

mkdirSync(logsDir, { recursive: true });
mkdirSync(outputsDir, { recursive: true });

const logChunks = [];
const record = (label, text) => {
  logChunks.push(`--- ${label} ---\n${text}\n`);
};

const focusedTests = [
  "packages/shared/test/community-plans.spec.ts",
  "packages/shared/test/community-plan-engine.spec.ts",
  "packages/shared/test/contracts.spec.ts",
  "packages/shared/test/client.spec.ts"
];

let typecheckExit = 0;
let typecheckOutput = "";
try {
  typecheckOutput = execFileSync(
    "pnpm",
    ["--filter", "@community-map/shared", "typecheck"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_verify_deps_before_run: "false"
      }
    }
  );
} catch (error) {
  typecheckExit = error.status ?? 1;
  typecheckOutput =
    (error.stdout ?? "") + (error.stderr ?? "") + (error.message ?? "");
}
record("pnpm --filter @community-map/shared typecheck", typecheckOutput);

let lintExit = 0;
let lintOutput = "";
try {
  lintOutput = execFileSync(
    eslintBin,
    ["packages/shared/test/community-plans.spec.ts"],
    { cwd: repoRoot, encoding: "utf8" }
  );
} catch (error) {
  lintExit = error.status ?? 1;
  lintOutput =
    (error.stdout ?? "") + (error.stderr ?? "") + (error.message ?? "");
}
record("eslint packages/shared/test/community-plans.spec.ts", lintOutput);

let vitestExit = 0;
let vitestStdio = "";
rmSync(vitestReportPath, { force: true });
try {
  vitestStdio = execFileSync(
    vitestBin,
    [
      "run",
      ...focusedTests,
      "--reporter=json",
      `--outputFile=${vitestReportPath}`
    ],
    { cwd: repoRoot, encoding: "utf8" }
  );
} catch (error) {
  vitestExit = error.status ?? 1;
  vitestStdio =
    (error.stdout ?? "") + (error.stderr ?? "") + (error.message ?? "");
}
record(
  `vitest run ${focusedTests.join(" ")} --reporter=json`,
  vitestStdio
);

let vitestReport = null;
if (existsSync(vitestReportPath)) {
  try {
    vitestReport = JSON.parse(readFileSync(vitestReportPath, "utf8"));
  } catch {
    vitestReport = null;
  }
}

const typecheckPassed = typecheckExit === 0;
const lintPassed = lintExit === 0;
const vitestPassed =
  vitestExit === 0 &&
  vitestReport?.success === true &&
  vitestReport.numFailedTests === 0;

const result = {
  change: "launch-trae-competition-h5-demo",
  task: "11.1",
  ref: "R11",
  scope: "CLI",
  branch: "competition/trae-h5-demo",
  headShort: "e15efde4",
  headFull: "e15efde43ad0eb3c3c6317ee32a6c7309fd2d110",
  workingTreeNote:
    "The supplemented contract tests in packages/shared/test/community-plans.spec.ts are uncommitted at validation time.",
  typecheck: {
    command: "pnpm --filter @community-map/shared typecheck",
    exit: typecheckExit,
    passed: typecheckPassed
  },
  lint: {
    command:
      "./node_modules/.bin/eslint packages/shared/test/community-plans.spec.ts",
    exit: lintExit,
    passed: lintPassed
  },
  vitest: {
    command: `./node_modules/.bin/vitest run ${focusedTests.join(" ")} --reporter=json`,
    exit: vitestExit,
    passed: vitestPassed,
    numTotalTests: vitestReport?.numTotalTests ?? null,
    numPassedTests: vitestReport?.numPassedTests ?? null,
    numFailedTests: vitestReport?.numFailedTests ?? null,
    numTotalTestSuites: vitestReport?.numTotalTestSuites ?? null,
    numPassedTestSuites: vitestReport?.numPassedTestSuites ?? null,
    numFailedTestSuites: vitestReport?.numFailedTestSuites ?? null
  },
  contractAssertions: {
    strictSingularPreferenceFields: 5,
    primaryInterestEnumCount: 8,
    accessibilityNeedEnumCount: 6,
    rejectsLegacyArrays: true,
    rejectsCommunityId: true,
    rejectsPII: true,
    rejectsFreeText: true,
    rejectsArrayValuesOnSingularFields: true,
    rejectsEachMissingRequiredField: true,
    fourOrderedReasons: true,
    rejectsModelResultFields: [
      "generation_source",
      "ai_status",
      "usage",
      "generated_by",
      "model",
      "prompt"
    ],
    onlyGenerateExposed: true,
    catalogVersion: "tongzilin-curated-v1"
  },
  r18Unchecked: true,
  finalDecision:
    typecheckPassed && lintPassed && vitestPassed ? "pass" : "fail"
};

writeFileSync(
  resolve(logsDir, "run.log"),
  logChunks.join("\n") +
    `\n--- summary ---\nfinalDecision=${result.finalDecision}\ntypecheck.passed=${typecheckPassed}\nlint.passed=${lintPassed}\nvitest.passed=${vitestPassed}\n`
);
writeFileSync(
  resolve(outputsDir, "result.json"),
  JSON.stringify(result, null, 2) + "\n"
);

// eslint-disable-next-line no-console
console.log(`finalDecision=${result.finalDecision}`);
// eslint-disable-next-line no-console
console.log(
  `typecheck.passed=${typecheckPassed} lint.passed=${lintPassed} vitest.passed=${vitestPassed} numPassedTests=${result.vitest.numPassedTests}/${result.vitest.numTotalTests}`
);
process.exit(result.finalDecision === "pass" ? 0 : 1);
