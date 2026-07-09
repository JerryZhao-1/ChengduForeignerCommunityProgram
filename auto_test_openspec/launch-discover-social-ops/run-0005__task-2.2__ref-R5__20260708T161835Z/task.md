# Validation Bundle: launch-discover-social-ops / task 2.2 / R5

- change-id: launch-discover-social-ops
- run: RUN #5
- task-id: 2.2
- ref-id: R5
- scope: MIXED

## How to Run

macOS/Linux start-server:

```bash
auto_test_openspec/launch-discover-social-ops/run-0005__task-2.2__ref-R5__20260708T161835Z/run.sh
```

Windows start-server:

```bat
auto_test_openspec\launch-discover-social-ops\run-0005__task-2.2__ref-R5__20260708T161835Z\run.bat
```

CLI typecheck:

```bash
auto_test_openspec/launch-discover-social-ops/run-0005__task-2.2__ref-R5__20260708T161835Z/tests/test_cli_mobile_typecheck.sh
```

## Inputs

No external input files are required. The GUI runbook uses seeded profiles `user_001`, `user_002`, and unavailable `user_inactive`.

## Outputs

- `logs/mobile-h5-server.log`: server transcript from `run.sh` / `run.bat`.
- `logs/mobile-typecheck.log`: CLI typecheck transcript.
- GUI evidence to be captured by Supervisor under `outputs/screenshots/` and indexed in `logs/screenshots-index.md`.

## Expected Results

- CLI typecheck exits with code 0.
- Self profile renders API-backed current user fields and hides follow controls.
- Other profile renders API-backed profile data, posts, video tab, counts, and follow state.
- Follow/unfollow toggles persist after reload.
- Unavailable profile renders the safe unavailable state.

## GUI Runbook

Use MCP only. See `tests/gui_runbook_profile_follow.md`.

## Provenance

Expected results are derived from task 2.2 ACCEPT criteria: profile page renders API-backed public profile data, posts, video posts, counts, follow state, and safe unavailable-profile states.
