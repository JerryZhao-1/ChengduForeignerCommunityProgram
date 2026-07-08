change-id: connect-discover-to-community-modules
run: 0004
task-id: 2.1
ref-id: R4
scope: MIXED

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

`run.sh` / `run.bat` are start-server only for the GUI portion. Use `tests/gui_runbook_discover_create_detail.md` with MCP browser tools. Optional CLI provenance: run `node_modules/.pnpm/node_modules/.bin/vue-tsc --noEmit -p apps/mobile/tsconfig.json` from repo root and save output in `logs/`.

## Expected results

Mobile typecheck exits 0. MCP evidence shows create page place/event selectors, event-id prefill from event detail, successful associated post creation, detail association cards, navigation to place/event detail, and unavailable association fallback.

## Provenance

Expected assertions are derived from task 2.1 ACCEPT. Worker does not declare PASS/FAIL.
