# Validation Bundle

- change-id: complete-week8-places-cloudbase-integration-and-volunteer-import
- run: 10
- task-id: 4.2
- ref-id: R11
- scope: MIXED

## Purpose

HTTP access /api route remains deferred because function verification could not run without CloudBase auth.

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
