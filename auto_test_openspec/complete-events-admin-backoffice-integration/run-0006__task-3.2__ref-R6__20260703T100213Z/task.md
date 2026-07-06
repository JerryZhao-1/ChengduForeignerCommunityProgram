# Validation Bundle: Task 3.2

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #6`
- task-id: `3.2`
- ref-id: `R6`
- scope: `MIXED`

## How To Run

CLI check to record before GUI:

```bash
corepack pnpm --filter @community-map/admin typecheck
```

Start services with `bash run.sh` or `run.bat`.

## Outputs

Service logs are written under `logs/`; GUI evidence goes under `outputs/screenshots/`.

## Expected Results

Admin can create a draft, edit bilingual title/capacity/date fields, persist after refresh, and validation/API errors keep the dialog open with a visible error.

## GUI Runbook

Use `tests/gui_runbook_event_create_edit.md`. GUI execution must be MCP-only.
