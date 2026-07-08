# Validation Bundle: R5

change-id: harden-discover-governance-console
run: 0005
task-id: 2.2
ref-id: R5
scope: MIXED

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

The script is start-server only for GUI validation. It starts Admin at `http://127.0.0.1:5173/`.

## GUI Verification

Use MCP only, following `tests/gui_runbook_drawers_actions.md`. Expected evidence: drawer review for post/comment/report, single moderation action, batch action, and refreshed queue state.

## Provenance

Expected results are derived from task ACCEPT and the implemented admin drawer/action workflows.
