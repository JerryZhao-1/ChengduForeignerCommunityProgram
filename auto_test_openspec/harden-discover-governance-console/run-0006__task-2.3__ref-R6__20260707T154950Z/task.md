# Validation Bundle: R6

change-id: harden-discover-governance-console
run: 0006
task-id: 2.3
ref-id: R6
scope: MIXED

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

The script is start-server only for GUI validation. It starts Admin at `http://127.0.0.1:5173/`.

## GUI Verification

Use MCP only, following `tests/gui_runbook_user_governance.md`. Expected evidence: user queue, user detail drawer, role flags, history tables, and warn/mute/ban/restore state transitions.

## Provenance

Expected results are derived from task ACCEPT and the implemented user governance workflow.
