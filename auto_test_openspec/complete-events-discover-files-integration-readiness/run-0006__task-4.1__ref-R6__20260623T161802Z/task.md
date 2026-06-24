change-id: complete-events-discover-files-integration-readiness
run: 0006
task-id: 4.1
ref-id: R6
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs file public upload, protected path denial, and private URL boundary tests.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
