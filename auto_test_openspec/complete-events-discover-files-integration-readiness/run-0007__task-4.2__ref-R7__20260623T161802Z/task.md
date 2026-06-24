change-id: complete-events-discover-files-integration-readiness
run: 0007
task-id: 4.2
ref-id: R7
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs invalid actor, admin role denial, and notification ownership tests.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
