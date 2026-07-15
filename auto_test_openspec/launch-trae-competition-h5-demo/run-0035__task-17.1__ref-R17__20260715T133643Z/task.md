# Corrected AI-free local release gate

- Change: `launch-trae-competition-h5-demo`
- Run: `0035`
- Task: `17.1`
- Ref: `R17`
- Scope: `CLI`
- HEAD under test: recorded by `run.sh` / `run.bat` at execution time
- Provenance: append-only correction for run-0034. Run-0034 remains immutable and is not release-PASS evidence because it mixed CLI and GUI responsibilities and its `rg` check did not distinguish a clean no-match exit (`1`) from an execution error (`2+`).

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0035__task-17.1__ref-R17__20260715T133643Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0035__task-17.1__ref-R17__20260715T133643Z\run.bat`

Both scripts run the complete R17 CLI gate from any working directory. This CLI-only bundle intentionally contains no GUI launcher or screenshot placeholder. GUI verification is isolated in the new R16 run-0036 bundle.

## Inputs, outputs, and expected result

- Input: current worktree, active OpenSpec change, shared/API/mobile tests, and both mobile build targets.
- Outputs: `logs/run.log`, `outputs/checks.json`, and generated H5/mp-weixin build artifacts.
- Expected: all nine gate commands exit `0`; focused coverage tests exit `0`; both target artifacts exist; the forbidden-marker scan returns exactly `1` (no matches); scan execution errors return failure; production source remains unchanged; and `outputs/checks.json` matches `expected/checks.json`.

## Machine-decidable assertions

1. Strict OpenSpec validation exits `0`.
2. Shared, API, mobile, and root typechecks exit `0`.
3. Root tests and lint exit `0`.
4. H5 and mp-weixin builds exit `0` and their entry artifacts exist.
5. Focused tests assert 21/21 modules, 576/576 scenarios, 576 unique keys, 1,152/1,152 localized cases, 576/576 provider/local parity, and zero reason/module mismatches.
6. Forbidden model-runtime scan: exit `0` fails for matches, exit `1` passes, and exit `2+` fails as a scan error.
7. No production source changes are present in staged, unstaged, or untracked state.
8. Consolidated output matches the expected JSON exactly.

## Boundary

This is a corrected R17 CLI retry. Run-0034 is preserved unchanged for audit history. R16 GUI verification is executed separately under run-0036, whose launchers are start-server-only as required for MIXED bundles.
