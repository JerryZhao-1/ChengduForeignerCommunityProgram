# Create iOS Android true-device public package runbooks and evidence index

change-id: `production-public-launch-closure`
run: `0011`
task-id: `4.2`
ref-id: `R11`
SCOPE: GUI

## How to run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

## Test inputs

No external input file is required.

## Test outputs

- Logs: `logs/run.log`
- Machine-readable outputs: `outputs/*.json`
- Expected criteria: `expected/result.json`

## Expected results

- The command exits 0.
- Required docs, config, scripts, or tests exist.
- Machine-readable output has `"status": "pass"`.
- Human-owned work is collected as evidence pointers and is not marked complete by automation.

GUI evidence MUST be collected through the MCP/human runbook under `tests/`; no executable browser automation is included.

Folder: `run-0011__task-4.2__ref-R11__20260709T090011Z`
