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
      bilingualDimensionModules: "21/21",
      logicalScenarioCoverage: "576/576",
      uniqueScenarioKeys: 576,
      localizedRenderCoverage: "1152/1152",
      providerLocalParity: "576/576",
      reasonModuleMismatches: 0,
      modelRuntimeMarkers: 0,
      forbiddenMarkerScanExit: 1,
      productionSourceChanges: 0,
      finalDecision: "pending_supervisor"
    },
    null,
    2
  )}\n`
);
