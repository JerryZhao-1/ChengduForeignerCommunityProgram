change-id: connect-discover-to-community-modules
run: 0003
task-id: 1.3
ref-id: R3
scope: CLI

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected results

Shared client tests and API integration tests complete with exit code 0. Assertions cover `/discover/places/:placeId/posts`, `/discover/events/:eventId/posts`, bounded query serialization, moderated post exclusion, and unavailable event not-found behavior.

## Provenance

Expected assertions are derived from task 1.3 ACCEPT and related tests added in this change. Worker does not declare PASS/FAIL.
