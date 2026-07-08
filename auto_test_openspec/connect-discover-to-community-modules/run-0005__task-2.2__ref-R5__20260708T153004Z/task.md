change-id: connect-discover-to-community-modules
run: 0005
task-id: 2.2
ref-id: R5
scope: MIXED

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

Use `tests/gui_runbook_related_sections.md` with MCP browser tools. Optional CLI provenance: run mobile typecheck and save output in `logs/`.

## Expected results

Place detail and event detail show related discover cards only when visible related posts exist. Empty related lists do not render placeholder or future-tense primary content. Card taps navigate to discover detail.

## Provenance

Expected assertions are derived from task 2.2 ACCEPT. Worker does not declare PASS/FAIL.
