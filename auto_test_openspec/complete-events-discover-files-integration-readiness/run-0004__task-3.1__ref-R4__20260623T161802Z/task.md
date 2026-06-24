change-id: complete-events-discover-files-integration-readiness
run: 0004
task-id: 3.1
ref-id: R4
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs discover public feed/detail visibility and post creation validation tests.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
