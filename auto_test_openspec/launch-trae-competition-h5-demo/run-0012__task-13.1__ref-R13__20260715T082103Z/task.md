# API, provider, guest-security, and privacy validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0012`
- Task: `13.1`
- Ref: `R13`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 13.1 ACCEPT/TEST.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0012__task-13.1__ref-R13__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0012__task-13.1__ref-R13__20260715T082103Z\run.bat`

## Inputs and outputs

- Inputs: API Community Plan route/provider, guest authorization/limiter behavior, and focused API tests.
- Output: `logs/run.log` containing API typecheck and focused test results.

## Expected result

- API typecheck exits `0`.
- Community Plan, app authorization, and CloudBase provider tests all pass, covering strict requests, 576 provider profiles, limiter bounds, privacy-safe log fields, guest write denial, and missing curated data.
- Any failure yields a non-zero script exit. The Supervisor records final PASS/FAIL after execution.

