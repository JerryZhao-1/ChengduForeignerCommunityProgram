# Community Plan online/offline parity review — corrected retry (R15)

- Change: `launch-trae-competition-h5-demo`
- Run: `0030`
- Task: `15.1`
- Ref: `R15`
- Scope: `CLI`
- Branch: `competition/trae-h5-demo`
- Baseline HEAD: `e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`
- Corrects: run-0028 hard-coded parity/safety claims without checking named assertions or `expected/`.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0030__task-15.1__ref-R15__20260715T122858Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0030__task-15.1__ref-R15__20260715T122858Z\run.bat`

The verifier runs mobile typecheck, lint, focused adapter/store/engine suites, and an evidence-specific serialized-bundle safety test. PASS requires every named parity/fallback/session/safety assertion to exist and pass. Computed result and parity summaries must exactly match both files under `expected/`.

## Inputs and outputs

- Input: the current worktree, mobile adapter/store tests, shared matcher tests, serialized `communityPlanCatalogBundle`, `tests/evidence-assertions.spec.ts`, and both expected JSON files.
- Output: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`, and `outputs/parity-summary.json`.
- The safety test recursively rejects credential/config keys and CloudBase/local/API backend address patterns in the serialized offline bundle. It also proves `deliveryMode` is rejected by the strict plan schema.

## Boundary

This CLI retry corrects only R15 evidence integrity. It does not validate GUI behavior, public deployment, R18, or TRAE Session provenance.
