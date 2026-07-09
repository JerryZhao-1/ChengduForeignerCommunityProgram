# Validation Bundle: launch-discover-social-ops / task 3.1 / R6

- change-id: launch-discover-social-ops
- run: RUN #6
- task-id: 3.1
- ref-id: R6
- scope: MIXED

## How to Run

macOS/Linux start-server:

```bash
auto_test_openspec/launch-discover-social-ops/run-0006__task-3.1__ref-R6__20260708T162443Z/run.sh
```

Windows start-server:

```bat
auto_test_openspec\launch-discover-social-ops\run-0006__task-3.1__ref-R6__20260708T162443Z\run.bat
```

CLI checks:

```bash
auto_test_openspec/launch-discover-social-ops/run-0006__task-3.1__ref-R6__20260708T162443Z/tests/test_cli_admin_ops.sh
```

## Inputs

No external input files are required. GUI validation uses seeded admin actor `user_001`.

## Outputs

- `logs/admin-server.log`: server transcript from start-server script.
- `logs/admin-ops-cli.log`: admin typecheck and focused Vitest transcript.
- GUI evidence to be captured by Supervisor under `outputs/screenshots/`.

## Expected Results

- CLI checks exit with code 0.
- Admin `/posts` page exposes the new `运营` tab.
- Post ops controls can save pinned/featured/recommended/official/rank metadata and refresh with the saved state.
- Tag taxonomy form can save a tag, list it, toggle hidden/active, and create audit records.

## GUI Runbook

Use MCP only. See `tests/gui_runbook_admin_ops.md`.

## Provenance

Expected results are derived from task 3.1 ACCEPT criteria: admin can manage pinned, featured, recommended, official posts, rank, and tag taxonomy through shared API contracts and audited operations.
