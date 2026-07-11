import { writeFileSync } from "node:fs";
const [testExit, apiExit, sharedExit, outputPath] = process.argv.slice(2);
writeFileSync(outputPath, `${JSON.stringify({
  change: "complete-mobile-english-language-support",
  task: "2.1",
  ref: "R3",
  commands: [
    { command: "focused provider/API/shared Vitest suite", exitCode: Number(testExit), log: "logs/focused-provider-tests.log" },
    { command: "pnpm --filter @community-map/api typecheck", exitCode: Number(apiExit), log: "logs/api-typecheck.log" },
    { command: "pnpm --filter @community-map/shared typecheck", exitCode: Number(sharedExit), log: "logs/shared-typecheck.log" }
  ],
  assertions: {
    preferenceAndNormalizationCasesExecuted: Number(testExit) === 0,
    apiTypecheckCompleted: Number(apiExit) === 0,
    sharedTypecheckCompleted: Number(sharedExit) === 0
  }
}, null, 2)}\n`);
