change-id: complete-events-discover-files-integration-readiness
run: 0001
task-id: 1.1
ref-id: R1
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs shared mock readiness tests for deterministic actors, event/post states, file assets, notification ownership fixtures, and stable error-code availability.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
