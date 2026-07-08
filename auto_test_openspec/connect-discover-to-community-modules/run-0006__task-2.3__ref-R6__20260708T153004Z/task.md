change-id: connect-discover-to-community-modules
run: 0006
task-id: 2.3
ref-id: R6
scope: MIXED

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

Use `tests/gui_runbook_profile_authors.md` with MCP browser tools. Optional CLI provenance: run mobile typecheck and save output in `logs/`.

## Expected results

Discover detail author and comment author rendering uses API payload summaries. Profile pages derive display data from `/auth/me` for self and public post author summaries for other users. No hardcoded author map remains in mobile source.

## Provenance

Expected assertions are derived from task 2.3 ACCEPT. Worker does not declare PASS/FAIL.
