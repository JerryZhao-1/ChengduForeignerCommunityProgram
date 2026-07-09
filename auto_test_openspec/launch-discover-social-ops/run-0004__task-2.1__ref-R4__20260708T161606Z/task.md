# Validation Bundle: launch-discover-social-ops / task 2.1 / R4

- change-id: launch-discover-social-ops
- run: RUN #4
- task-id: 2.1
- ref-id: R4
- scope: MIXED

## How to Run

macOS/Linux start-server:

```bash
auto_test_openspec/launch-discover-social-ops/run-0004__task-2.1__ref-R4__20260708T161606Z/run.sh
```

Windows start-server:

```bat
auto_test_openspec\launch-discover-social-ops\run-0004__task-2.1__ref-R4__20260708T161606Z\run.bat
```

CLI typecheck:

```bash
auto_test_openspec/launch-discover-social-ops/run-0004__task-2.1__ref-R4__20260708T161606Z/tests/test_cli_mobile_typecheck.sh
```

## Inputs

No external input files are required. The GUI runbook uses seeded mock/HTTP discover post `post_001` and actor `user_002`.

## Outputs

- `logs/mobile-h5-server.log`: server transcript from `run.sh` / `run.bat`.
- `logs/mobile-typecheck.log`: CLI typecheck transcript from `tests/test_cli_mobile_typecheck.sh`.
- GUI evidence to be captured by Supervisor under `outputs/screenshots/` and indexed in `logs/screenshots-index.md`.

## Expected Results

- CLI typecheck exits with code 0.
- Mobile detail page loads `/pages/discover/detail?id=post_001`.
- Like and favorite buttons call provider-backed APIs, update counters, and survive page reload.
- Share sheet actions update the share count through the provider-backed share API.
- If an interaction API fails, the page shows a non-success toast and does not navigate away.

## GUI Runbook

Use MCP only. See `tests/gui_runbook_discover_detail_social.md`.

## Provenance

Expected results are derived from task 2.1 ACCEPT criteria: detail like/favorite/share actions update provider-backed state and survive reload with counts matching API responses.
