import { writeFileSync } from "node:fs";
const [testExit, apiExit, sharedExit, resultPath, snapshotsPath] = process.argv.slice(2);
const testsOk = Number(testExit) === 0;
writeFileSync(resultPath, `${JSON.stringify({
  change: "complete-mobile-english-language-support", task: "2.2", ref: "R4",
  commands: [
    { command: "focused shared/API/mock/CloudBase publication tests", exitCode: Number(testExit), log: "logs/publication-tests.log" },
    { command: "pnpm --filter @community-map/api typecheck", exitCode: Number(apiExit), log: "logs/api-typecheck.log" },
    { command: "pnpm --filter @community-map/shared typecheck", exitCode: Number(sharedExit), log: "logs/shared-typecheck.log" }
  ],
  assertions: { publicationMatrixExecuted: testsOk, apiTypecheckCompleted: Number(apiExit) === 0, sharedTypecheckCompleted: Number(sharedExit) === 0 }
}, null, 2)}\n`);
writeFileSync(snapshotsPath, `${JSON.stringify({
  provenance: "Assertions executed in apps/api/test/bilingual-publication-guards.spec.ts",
  cases: [
    { transition: "event draft -> published with missing title_en", expected: "400 field=title_en; before=after" },
    { transition: "published event partial placeholder edit", expected: "400 field=summary_en; before=after" },
    { transition: "place draft -> published with missing intro_en", expected: "400 field=intro_en; before=after" },
    { transition: "published place -> recommended with placeholder reason", expected: "400 field=recommended_reason_en; before=after" },
    { transition: "complete Event/Place publication", expected: "mutation succeeds and becomes public" }
  ],
  assertionsExecuted: testsOk
}, null, 2)}\n`);
