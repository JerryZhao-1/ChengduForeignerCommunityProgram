change-id: complete-discover-core-content-loop
run: 0008
task-id: 3.1
ref-id: R8
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- OpenSpec strict validation exits 0.
- Shared/API/mobile typechecks exit 0.
- Full focused Vitest command exits 0.
- Logs are written under `logs/`.

Inputs: repository source tree.
Outputs: `logs/openspec.log`, `logs/shared-typecheck.log`, `logs/api-typecheck.log`, `logs/mobile-typecheck.log`, `logs/vitest.log`.
Expected provenance: assertions are derived from task ACCEPT, committed docs, and committed tests.
