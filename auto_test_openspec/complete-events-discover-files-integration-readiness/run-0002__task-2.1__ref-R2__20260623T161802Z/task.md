change-id: complete-events-discover-files-integration-readiness
run: 0002
task-id: 2.1
ref-id: R2
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs events public visibility and admin publication route tests.
- Includes CloudBase handler fallback parity tests for non-places routes.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
