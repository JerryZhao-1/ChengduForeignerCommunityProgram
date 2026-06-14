# Validation Bundle

- change-id: complete-week8-places-cloudbase-integration-and-volunteer-import
- run: 4
- task-id: 2.1
- ref-id: R4
- scope: MIXED

## Purpose

Public list/detail tolerate no gallery, no tags, no recommendation, and missing optional address/text.

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

## Expected Results

- `run.sh` / `run.bat` exits with code 0 for CLI assertions or starts the required local service for GUI scope.
- Logs are written under `logs/`.
- Outputs, when produced, are written under `outputs/`.
- GUI/MIXED browser verification steps are documented in `tests/gui_runbook.md` and must be executed by the Supervisor with MCP/browser tooling.

## Assumptions

- Default repo dependencies are installed with `pnpm install`.
- CloudBase live deployment remains blocked unless MCP authentication is completed.
