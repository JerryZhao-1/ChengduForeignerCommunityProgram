# Create the public launch ownership matrix and closure status model

change-id: `production-public-launch-closure`
run: `0001`
task-id: `1.1`
ref-id: `R1`
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



Folder: `run-0001__task-1.1__ref-R1__20260709T090001Z`
