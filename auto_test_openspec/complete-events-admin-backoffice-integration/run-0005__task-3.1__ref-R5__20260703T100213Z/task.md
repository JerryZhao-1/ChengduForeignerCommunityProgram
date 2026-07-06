# Validation Bundle: Task 3.1

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #5`
- task-id: `3.1`
- ref-id: `R5`
- scope: `MIXED`

## How To Run

CLI check to record before GUI:

```bash
corepack pnpm --filter @community-map/admin typecheck
```

Start services for GUI:

```bash
bash run.sh
```

Windows:

```bat
run.bat
```

## Outputs

Service logs are written under `logs/`. Supervisor GUI evidence should be stored under `outputs/screenshots/` and indexed in `logs/screenshots.md`.

## Expected Results

Admin `/events` loads from `admin.listEvents()`, shows draft and published rows, supports review/publish/keyword/draft/published filters, and has visible loading/error/empty states where practical.

## GUI Runbook

Use `tests/gui_runbook_events_table_filters.md`. GUI execution must be driven by MCP only; do not use browser automation scripts.
