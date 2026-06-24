change-id: complete-events-discover-files-integration-readiness
run: 0008
task-id: 5.1
ref-id: R8
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs CloudBase handler fallback parity tests for representative events, discover, files, notifications/auth semantics.

Expected result:
- Vitest exits 0.
- Logs are written under `logs/`.
- This is fallback parity only, not live provider persistence evidence.
