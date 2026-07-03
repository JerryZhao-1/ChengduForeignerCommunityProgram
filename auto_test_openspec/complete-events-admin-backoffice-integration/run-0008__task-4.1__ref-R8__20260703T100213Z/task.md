# Validation Bundle: Task 4.1

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #8`
- task-id: `4.1`
- ref-id: `R8`
- scope: `MIXED`

## How To Run

CLI check to record before GUI:

```bash
corepack pnpm exec vitest run apps/api/test/app.spec.ts packages/shared/test/integration-readiness.spec.ts
```

Start services with `bash run.sh` or `run.bat`.

## Outputs

Service logs are written under `logs/`; GUI evidence goes under `outputs/screenshots/`.

## Expected Results

Registration drawer loads admin registration rows with contact data and ticket state, and shows explicit empty/error states.

## GUI Runbook

Use `tests/gui_runbook_registration_drawer.md`. GUI execution must be MCP-only.
