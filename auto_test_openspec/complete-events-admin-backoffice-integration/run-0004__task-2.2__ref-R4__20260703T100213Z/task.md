# Validation Bundle: Task 2.2

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #4`
- task-id: `2.2`
- ref-id: `R4`
- scope: `CLI`

## How To Run

Run `bash run.sh` on macOS/Linux or `run.bat` on Windows.

## Expected Results

The bundle runs event integration readiness tests. Expected result is exit code `0`; logs must show draft public-hidden behavior, publish public-visible behavior, registration duplicate/full/ended/deadline conflicts, ticket ownership, and check-in conflict paths.

## Provenance

Assertions are derived from task ACCEPT and existing launch-readiness semantics.
