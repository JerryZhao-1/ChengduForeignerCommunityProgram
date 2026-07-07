change-id: complete-discover-core-content-loop
run: 0002
task-id: 1.2
ref-id: R2
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- API TypeScript typecheck exits 0.
- API Vitest suite exits 0 and includes discover comment/my-post readiness assertions.
- Logs are written under `logs/`.

Inputs: repository source tree.
Outputs: `logs/typecheck.log`, `logs/vitest-api.log`.
Expected provenance: assertions are derived from task ACCEPT and committed API tests.
