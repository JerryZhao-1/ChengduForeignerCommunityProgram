change-id: connect-discover-to-community-modules
run: 0001
task-id: 1.1
ref-id: R1
scope: CLI

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected results

The shared contract/client tests and shared TypeScript check complete with exit code 0. This validates nullable `place_id` and `event_id` create/payload support, related query schemas, comment author summaries, and notification metadata schema compatibility.

## Provenance

Expected assertions are derived from task 1.1 ACCEPT plus the shared schema/client tests added in this change. Worker does not declare PASS/FAIL.
