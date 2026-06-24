change-id: complete-events-discover-files-integration-readiness
run: 0005
task-id: 3.2
ref-id: R5
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs discover comments, report hiding, and admin moderation route tests.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
