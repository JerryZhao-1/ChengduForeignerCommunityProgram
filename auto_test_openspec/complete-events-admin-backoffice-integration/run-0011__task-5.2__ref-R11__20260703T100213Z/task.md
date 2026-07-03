# Validation Bundle: Task 5.2

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #11`
- task-id: `5.2`
- ref-id: `R11`
- scope: `MIXED`

## How To Run

Run `bash run.sh` on macOS/Linux or `run.bat` on Windows.

## Outputs

CLI command logs are written to `logs/final-cli.log`. Service logs are written under `logs/`. GUI evidence should be stored under `outputs/screenshots/` and indexed in `logs/screenshots.md`.

## Expected Results

Final validation captures exit codes for OpenSpec strict validation, full Vitest suite, lint, full typecheck, and Admin/Mobile GUI smoke for create/edit/publish/offline/registration/check-in.

## GUI Runbook

Use `tests/gui_runbook_final_smoke.md`. GUI execution must be MCP-only.
