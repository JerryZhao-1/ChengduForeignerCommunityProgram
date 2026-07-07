change-id: complete-discover-core-content-loop
run: 0001
task-id: 1.1
ref-id: R1
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- Shared TypeScript typecheck exits 0.
- Focused shared Vitest suites exit 0.
- Logs are written under `logs/`.

Inputs: repository source tree.
Outputs: `logs/typecheck.log`, `logs/vitest-shared.log`.
Expected provenance: assertions are derived from task ACCEPT and committed shared tests.
