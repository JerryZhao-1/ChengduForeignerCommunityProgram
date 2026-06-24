change-id: complete-events-discover-files-integration-readiness
run: 0010
task-id: 6.1
ref-id: R10
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Runs strict OpenSpec validation.
- Runs targeted shared/API Vitest coverage.
- Runs affected shared/API typechecks.
- Runs lint; if lint fails because of generated artifacts, writes `logs/lint-blocker.txt` with the scoped blocker.

Expected result:
- OpenSpec, Vitest, and typechecks exit 0.
- Lint output is recorded in `logs/lint.log`; a scoped blocker file is acceptable when lint fails on generated bundle paths.
