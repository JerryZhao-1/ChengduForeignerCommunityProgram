# Local release-gate validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0016`
- Task: `17.1`
- Ref: `R17`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 17.1 ACCEPT/TEST.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0016__task-17.1__ref-R17__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0016__task-17.1__ref-R17__20260715T082103Z\run.bat`

Optional environment-provenance commands may be run separately and appended to `logs/environment.log`: `node --version`, `pnpm --version`, `openspec --version`.

## Inputs and outputs

- Inputs: the complete current worktree, active OpenSpec change, all tests, and both mobile build targets.
- Outputs: `logs/run.log`, generated mobile build artifacts, and `outputs/checks.json` written only after every command/assertion completes.
- Expected counts (asserted by the suite): 576/576 logical profiles/parity and 1,152/1,152 localized cases.

## Expected result

- `pnpm typecheck`, `pnpm test`, `pnpm lint`, both mobile builds, and strict OpenSpec validation exit `0`.
- Current runtime and H5 artifacts contain no Community Plan model adapter, secret name, call, or removed result field.
- Both target artifacts exist.
- `outputs/checks.json` records worker checks complete but leaves `finalDecision` as `pending_supervisor`; only the Supervisor records PASS/FAIL.

