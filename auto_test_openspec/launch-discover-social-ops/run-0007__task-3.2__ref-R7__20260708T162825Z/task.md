# Validation Bundle: launch-discover-social-ops / task 3.2 / R7

- change-id: launch-discover-social-ops
- run: RUN #7
- task-id: 3.2
- ref-id: R7
- scope: MIXED

## How to Run

macOS/Linux start-server:

```bash
auto_test_openspec/launch-discover-social-ops/run-0007__task-3.2__ref-R7__20260708T162825Z/run.sh
```

Windows start-server:

```bat
auto_test_openspec\launch-discover-social-ops\run-0007__task-3.2__ref-R7__20260708T162825Z\run.bat
```

CLI checks:

```bash
auto_test_openspec/launch-discover-social-ops/run-0007__task-3.2__ref-R7__20260708T162825Z/tests/test_cli_admin_analytics.sh
```

## Inputs

No external input files are required. GUI validation uses seeded admin actor `user_001`.

## Outputs

- `logs/admin-server.log`: server transcript from start-server script.
- `logs/admin-analytics-cli.log`: admin typecheck and focused Vitest transcript.
- GUI evidence to be captured by Supervisor under `outputs/screenshots/`.

## Expected Results

- CLI checks exit with code 0.
- Admin `/posts` page exposes the `分析` tab.
- Analytics cards show provider-backed content volume, moderation workload, engagement, active authors, popular places, and popular events.
- Non-admin access is rejected by API tests.

## GUI Runbook

Use MCP only. See `tests/gui_runbook_admin_analytics.md`.

## Provenance

Expected results are derived from task 3.2 ACCEPT criteria: admin analytics shows provider-backed metrics for selected windows.
