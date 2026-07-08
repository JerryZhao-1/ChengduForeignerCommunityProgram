# Validation Bundle: R4

change-id: harden-discover-governance-console
run: 0004
task-id: 2.1
ref-id: R4
scope: MIXED

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

The script is start-server only for GUI validation. It starts Admin at `http://127.0.0.1:5173/`.

## GUI Verification

Use MCP only, following `tests/gui_runbook_queues.md`. Expected evidence: screenshots or snapshots proving tabs and filters for posts, comments, reports, users, and audit history render with loading/empty/error-safe states.

## Provenance

Expected results are derived from task ACCEPT and the implemented `apps/admin/src/pages/PostsPage.vue`.
