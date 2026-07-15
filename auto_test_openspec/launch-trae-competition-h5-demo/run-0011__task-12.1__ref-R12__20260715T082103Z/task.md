# Curated catalog and exhaustive matcher validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0011`
- Task: `12.1`
- Ref: `R12`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 12.1 ACCEPT/TEST; expected counts come directly from the 8 × 3 × 4 × 6 requirement.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0011__task-12.1__ref-R12__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0011__task-12.1__ref-R12__20260715T082103Z\run.bat`

## Inputs and outputs

- Inputs: the curated catalog, matcher, fixtures, and exhaustive assertions in `packages/shared/test/community-plan-engine.spec.ts`.
- Outputs: `outputs/vitest.json` from the real focused test execution and `logs/run.log` from typecheck/output validation.
- Expected golden: `expected/coverage-summary.json` documents the required counts asserted by the test.

## Expected result

- Shared typecheck exits `0`.
- Vitest JSON reports zero failed tests.
- The exhaustive test asserts 576 logical scenarios, 576 unique scenario keys, 1,152 localized cases, zero invalid plans, and zero missing copy.
- `tests/verify-vitest.mjs` exits `0`; otherwise the bundle exits non-zero. The Supervisor records final PASS/FAIL after execution.

