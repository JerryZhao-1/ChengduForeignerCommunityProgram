# Validation Bundle: Task 4.2

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #9`
- task-id: `4.2`
- ref-id: `R9`
- scope: `MIXED`

## How To Run

CLI check to record before GUI:

```bash
corepack pnpm exec vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/app.spec.ts
```

Start services with `bash run.sh` or `run.bat`.

## Outputs

Service logs are written under `logs/`; GUI evidence goes under `outputs/screenshots/`.

## Expected Results

Valid ticket id check-in marks the ticket used and records used time. Missing, wrong-event, non-admin, and already-used ticket paths return clear errors and do not mutate unrelated tickets.

## GUI Runbook

Use `tests/gui_runbook_checkin.md`. GUI execution must be MCP-only.
