# Online/offline semantic parity validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0014`
- Task: `15.1`
- Ref: `R15`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 15.1 ACCEPT/TEST.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0014__task-15.1__ref-R15__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0014__task-15.1__ref-R15__20260715T082103Z\run.bat`

## Inputs and outputs

- Inputs: all 576 generated profiles, mock/local/HTTP adapter branches, and offline session-state tests.
- Outputs: `outputs/vitest.json` from the actual focused execution and `logs/run.log`.
- Expected golden: `expected/parity-summary.json` states the required parity/fallback outcomes.

## Expected result

- Shared and mobile typechecks exit `0`.
- Focused tests report zero failures and prove 576/576 semantic parity.
- Mock, transport, timeout, and 5xx local matching use `deliveryMode: offline`; 400/403/404/409/429 remain errors.
- Local visit/demo actions remain usable without writes.
- Machine verification exits non-zero for any failed test. The Supervisor records final PASS/FAIL after execution.

