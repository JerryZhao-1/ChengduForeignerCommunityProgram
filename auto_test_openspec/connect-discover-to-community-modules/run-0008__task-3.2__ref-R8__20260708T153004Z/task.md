change-id: connect-discover-to-community-modules
run: 0008
task-id: 3.2
ref-id: R8
scope: CLI

## How to run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected results

OpenSpec strict validation, focused Vitest, shared/API TypeScript checks, and mobile typecheck complete with exit code 0. If package manager policy blocks `pnpm`, use the direct local binary commands documented in `logs/`.

## Provenance

Expected assertions are derived from task 3.2 ACCEPT and docs updated in `docs/已实现API接口清单.md`. Worker does not declare PASS/FAIL.
