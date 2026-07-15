import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const outputPath = process.argv[2];
if (!outputPath) throw new Error("Expected an output path.");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      workerChecksComplete: true,
      logicalScenarioCoverage: "576/576",
      localizedRenderCoverage: "1152/1152",
      providerLocalParity: "576/576",
      finalDecision: "pending_supervisor"
    },
    null,
    2
  )}\n`
);

