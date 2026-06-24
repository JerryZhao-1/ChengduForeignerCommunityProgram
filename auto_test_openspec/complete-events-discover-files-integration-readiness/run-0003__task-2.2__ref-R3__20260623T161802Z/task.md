change-id: complete-events-discover-files-integration-readiness
run: 0003
task-id: 2.2
ref-id: R3
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs registration, ticket ownership, and check-in negative path route tests.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
