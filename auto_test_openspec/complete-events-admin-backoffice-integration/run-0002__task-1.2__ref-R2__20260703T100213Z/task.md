# Validation Bundle: Task 1.2

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #2`
- task-id: `1.2`
- ref-id: `R2`
- scope: `CLI`

## How To Run

Run `bash run.sh` on macOS/Linux or `run.bat` on Windows.

## Expected Results

The bundle runs API typecheck plus focused Koa and CloudBase tests. Expected result is exit code `0`; logs under `logs/run.log` must show admin event list, registration listing, non-admin denial, missing event registration list, and `/api` CloudBase prefix coverage.

## Provenance

Assertions are derived from the task ACCEPT block and implemented route files.
