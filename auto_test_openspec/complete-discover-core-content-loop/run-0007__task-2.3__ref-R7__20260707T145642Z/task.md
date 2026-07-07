change-id: complete-discover-core-content-loop
run: 0007
task-id: 2.3
ref-id: R7
scope: MIXED

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Expected result:
- Mobile vue-tsc exits 0.
- For GUI verification, run the MCP-only runbook at `tests/gui_runbook_my_posts.md`.
- `run.sh` / `run.bat` do not perform browser automation.

Inputs: repository source tree.
Outputs: `logs/mobile-typecheck.log`; GUI evidence should be recorded by Supervisor under a fresh evidence location.
Expected provenance: assertions are derived from task ACCEPT and mobile my-posts implementation.
