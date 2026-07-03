# Validation Bundle: Task 3.3

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #7`
- task-id: `3.3`
- ref-id: `R7`
- scope: `MIXED`

## How To Run

CLI check to record before GUI:

```bash
corepack pnpm exec vitest run apps/api/test/integration-readiness.spec.ts
```

Start services with `bash run.sh` or `run.bat`.

## Outputs

Service logs are written under `logs/`; GUI evidence goes under `outputs/screenshots/`.

## Expected Results

Status actions show pending states and success/error messages, refresh the table, publish to Mobile public Events, hide when offline, and restore when republished.

## GUI Runbook

Use `tests/gui_runbook_event_status_actions.md`. GUI execution must be MCP-only.
