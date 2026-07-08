change-id: connect-discover-to-community-modules
run: 0002
task-id: 1.2
ref-id: R2
scope: CLI

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected results

API integration readiness tests complete with exit code 0. Assertions cover valid place/event association creation, draft place rejection, offline event rejection, and no partial success for invalid association input.

## Provenance

Expected assertions are derived from task 1.2 ACCEPT and `apps/api/test/integration-readiness.spec.ts`. Worker does not declare PASS/FAIL.
