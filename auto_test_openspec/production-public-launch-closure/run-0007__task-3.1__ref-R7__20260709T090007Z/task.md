# Verify Admin production auth without mock actor headers

change-id: `production-public-launch-closure`
run: `0007`
task-id: `3.1`
ref-id: `R7`
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



Folder: `run-0007__task-3.1__ref-R7__20260709T090007Z`
