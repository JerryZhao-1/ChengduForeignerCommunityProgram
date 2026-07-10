# Add production content and media audit

change-id: `production-public-launch-closure`
run: `0010`
task-id: `4.1`
ref-id: `R10`
SCOPE: CLI

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

Inputs are documented under `inputs/` and/or the referenced docs/templates.

## Test outputs

- Logs: `logs/run.log`
- Machine-readable outputs: `outputs/*.json`
- Expected criteria: `expected/result.json`

## Expected results

- The command exits 0.
- Required docs, config, scripts, or tests exist.
- Machine-readable output has `"status": "pass"`.
- Human-owned work is collected as evidence pointers and is not marked complete by automation.



Folder: `run-0010__task-4.1__ref-R10__20260709T090010Z`
