import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const inputs = JSON.parse(
  fs.readFileSync(path.join(runDir, "inputs", "handoff.json"), "utf8")
);
const expected = JSON.parse(
  fs.readFileSync(path.join(runDir, "expected", "assertions.json"), "utf8")
);
const outputsDir = path.join(runDir, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });

const handoffPath = path.join(repoRoot, inputs.handoffDocument);
const evidenceRoot = path.join(repoRoot, inputs.evidenceRoot);
const assertions = [];
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  assertions.push(message);
};

assert(fs.existsSync(handoffPath), "handoff_document_exists");
const handoff = fs.readFileSync(handoffPath, "utf8");

assert(handoff.includes("## Recommendation"), "handoff_has_recommendation");
assert(
  handoff.includes("Do not submit for public launch yet"),
  "handoff_recommends_no_public_launch"
);
assert(handoff.includes("## Environment"), "handoff_has_environment");
assert(handoff.includes("## Completed Worker Evidence"), "handoff_has_worker_evidence");
assert(handoff.includes("## Module Status"), "handoff_has_module_status");
assert(handoff.includes("## Device Matrix"), "handoff_has_device_matrix");
assert(handoff.includes("## Known Blockers"), "handoff_has_known_blockers");
assert(handoff.includes("## Manual Test Entry Points"), "handoff_has_manual_entrypoints");

const missingRuns = inputs.requiredRuns.filter(
  (run) => !fs.existsSync(path.join(evidenceRoot, run))
);
assert(missingRuns.length === 0, "all_required_run_folders_exist");

const unlinkedRuns = inputs.requiredRuns.filter((run) => !handoff.includes(run));
assert(unlinkedRuns.length === 0, "all_required_runs_linked_in_handoff");

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

const result = {
  ok: true,
  handoffDocument: inputs.handoffDocument,
  evidenceRoot: inputs.evidenceRoot,
  requiredRuns: inputs.requiredRuns,
  assertions
};
fs.writeFileSync(
  path.join(outputsDir, "handoff-structure.json"),
  `${JSON.stringify(result, null, 2)}\n`
);
console.log(JSON.stringify(result, null, 2));
