change-id: connect-discover-to-community-modules
run: 0007
task-id: 3.1
ref-id: R7
scope: CLI

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected results

API integration tests complete with exit code 0. Assertions cover discover comment notification metadata, notification ownership/list-read isolation, self-notification suppression by implementation review, moderation/report notification creation paths, and existing mark-read behavior.

## Provenance

Expected assertions are derived from task 3.1 ACCEPT. Durable report-case workflow exists in this repository, so report-resolution notifications are implemented for the mock provider; CloudBase live notification persistence remains documented as production-readiness follow-up. Worker does not declare PASS/FAIL.
