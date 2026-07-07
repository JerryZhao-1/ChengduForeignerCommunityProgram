change-id: complete-discover-core-content-loop
run: 0004
task-id: 1.4
ref-id: R4
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- API typecheck exits 0 for CloudBase provider compile coverage.
- API CloudBase tests exit 0.
- Live CloudBase online smoke is not executed by this bundle unless credentials are externally configured; docs must not claim production readiness without evidence.

Inputs: repository source tree.
Outputs: `logs/typecheck.log`, `logs/vitest-cloudbase.log`.
Expected provenance: assertions are derived from task ACCEPT and committed API tests/docs.
