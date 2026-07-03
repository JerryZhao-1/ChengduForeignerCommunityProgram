# Validation Bundle: Task 2.1

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #3`
- task-id: `2.1`
- ref-id: `R3`
- scope: `CLI`

## How To Run

Run `bash run.sh` on macOS/Linux or `run.bat` on Windows.

## Expected Results

The bundle runs shared mock service/client tests and API app tests. Expected result is exit code `0`; logs must show admin list visibility for hidden states, capacity/full derived counts, registration rows with ticket state, and missing-id behavior.

## Provenance

Assertions are derived from task ACCEPT and the mock dataset fixtures.
