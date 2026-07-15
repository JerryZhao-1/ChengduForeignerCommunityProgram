# Singular contract validation — corrected Supervisor retry

- Change: `launch-trae-competition-h5-demo`
- Run: `0022`
- Task: `11.1`
- Ref: `R11`
- Scope: `CLI`
- Provenance: corrected successor to immutable run-0021. This run replaces the non-portable Windows logging pipeline and is executed independently by Codex as Supervisor.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0022__task-11.1__ref-R11__20260715T092820Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0022__task-11.1__ref-R11__20260715T092820Z\run.bat`

## Inputs and outputs

- Inputs: shared schemas, contracts, paths, client, and cases embedded in `packages/shared/test/community-plans.spec.ts`, `packages/shared/test/community-plan-engine.spec.ts`, and `packages/shared/test/client.spec.ts`.
- Logs: `logs/run.log` contains shared typecheck and focused Vitest output.
- Machine-readable output: `outputs/result.json` is written only after both commands succeed.
- Supervisor decision: `supervisor-verdict.md` records PASS/FAIL and evidence pointers after execution.

## Expected result

- Shared typecheck exits `0`.
- All three focused test files pass (54 tests total: 14 + 14 + 26).
- `outputs/result.json` contains `typecheckExit: 0`, `focusedTestsExit: 0`, `testFilesPassed: 3`, `testsPassed: 54`, and `finalDecision: "pass"`.
- Any command failure makes either script exit non-zero.
- The Windows runner uses native `cmd.exe` redirection and captures each command's `ERRORLEVEL`; it does not depend on `tee` or mask the left side of a pipeline.

## Boundary

- This is CLI evidence for R11 only. It does not replace R18 deployment or external acceptance evidence.
- The Windows runner is corrected by inspection but was not executed on this macOS Supervisor host.
