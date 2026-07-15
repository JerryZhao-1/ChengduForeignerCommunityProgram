# R13 evidence-integrity retry

- Change: `launch-trae-competition-h5-demo`
- Run: `0025`
- Task: `13.1`
- Ref: `R13`
- Scope: `CLI`
- Branch: `competition/trae-h5-demo`
- Validation-time HEAD: `6543f9e9`
- Provenance: Supervisor retry created to preserve immutable run-0024 while correcting Windows evidence capture. Product scope and acceptance criteria are unchanged from run-0024.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0025__task-13.1__ref-R13__20260715T111934Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0025__task-13.1__ref-R13__20260715T111934Z\run.bat`
- Both scripts resolve the repository from their own directory and write their command transcript to `logs/run.log`.
- The Windows script was inspected for parity but was not executed on this macOS host.

## Inputs, outputs, and expected result

- Input: current worktree, shared `tongzilin-curated-v1` catalog, Community Plan API/provider implementation, and focused tests.
- Outputs: `logs/run.log`, `logs/vitest.json`, and `outputs/result.json`.
- Expected:
  - API typecheck exits `0`.
  - Focused API tests exit `0` with 51/51 tests passing.
  - Shared engine tests exit `0` with 14/14 tests passing.
  - Focused ESLint exits `0`.
  - On Windows, stdout/stderr is captured to `logs/run.log`, replayed to the console, and the real subroutine exit code is returned.

## Acceptance and boundary

This retry validates the same R13 no-model API, guest security, limiter, strict input, envelope, privacy-safe logging, provider matcher, missing-catalog, and Places-isolation scope documented in run-0024. It additionally fixes cross-platform evidence capture. It does not prove Windows execution, GUI acceptance, or R18 public deployment.
