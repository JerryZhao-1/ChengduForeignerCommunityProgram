# Singular contract validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0010`
- Task: `11.1`
- Ref: `R11`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 11.1 ACCEPT/TEST.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0010__task-11.1__ref-R11__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0010__task-11.1__ref-R11__20260715T082103Z\run.bat`

## Inputs and outputs

- Inputs: shared schemas, contracts, client, and the request/plan cases embedded in `packages/shared/test/community-plans.spec.ts` and `packages/shared/test/client.spec.ts`.
- Output: `logs/run.log` with typecheck and focused Vitest results.

## Expected result

- Shared typecheck exits `0`.
- Both focused test files pass, including rejection of legacy arrays, unknown/PII fields, removed response fields, and malformed ordered explanations.
- Any command failure makes the script exit non-zero. The Supervisor records final PASS/FAIL after execution.

