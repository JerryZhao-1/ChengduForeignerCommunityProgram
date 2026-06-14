# Validation Bundle

- change-id: complete-week8-places-cloudbase-integration-and-volunteer-import
- run: 1
- task-id: 1.1
- ref-id: R1
- scope: CLI

## Purpose

Parser reads docs/志愿者点位采集表.xlsx and proves 19 point records plus duplicate 点位类型 preservation.

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
