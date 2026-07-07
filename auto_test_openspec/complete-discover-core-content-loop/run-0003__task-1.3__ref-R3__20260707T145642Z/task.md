change-id: complete-discover-core-content-loop
run: 0003
task-id: 1.3
ref-id: R3
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- API tests exit 0, including post media upload/binding guardrails.
- Logs are written under `logs/`.

Inputs: repository source tree.
Outputs: `logs/vitest-api.log`.
Expected provenance: assertions are derived from task ACCEPT and committed API tests.
