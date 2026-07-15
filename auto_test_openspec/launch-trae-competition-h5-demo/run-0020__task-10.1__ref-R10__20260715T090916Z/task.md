# AI-free specification migration review retry (S07A)

- Change: `launch-trae-competition-h5-demo`
- Run: `0020`
- Task: `10.1`
- Ref: `R10`
- Scope: `CLI`
- Provenance: replacement validation attempt for run 0019. Run 0019 is preserved because its Windows script did not propagate OpenSpec failures or execute all documented checks.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0020__task-10.1__ref-R10__20260715T090916Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0020__task-10.1__ref-R10__20260715T090916Z\run.bat`

Both scripts resolve the repository from their own directory, fail on validation or scan errors, run equivalent checks, and write `logs/run.log` plus `outputs/result.json`.

## Inputs, outputs, and expected result

- Input: the current worktree, active OpenSpec change, runtime source under `packages/shared/src`, `apps/api/src`, and `apps/mobile/src`, and product documentation under `docs/competition`.
- Output: `logs/run.log` and `outputs/result.json`.
- Expected: strict OpenSpec validation exits `0`; runtime and documentation scans complete successfully with zero forbidden positive model-runtime claims; R18 remains unchecked; the script exits nonzero on a failed command or scan error.

## Boundary

This run validates S07A only. It does not provide GUI acceptance, public deployment, Admin-hosting isolation, or R18 acceptance evidence. The TRAE session screenshot is stored at `docs/competition/evidence/trae-sessions/S07A/trae-session-overview.jpg`.
