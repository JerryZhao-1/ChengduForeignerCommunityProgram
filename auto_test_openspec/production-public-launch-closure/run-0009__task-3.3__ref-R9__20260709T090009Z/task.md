# Verify hosted Admin targets the selected launch API

change-id: `production-public-launch-closure`
run: `0009`
task-id: `3.3`
ref-id: `R9`
SCOPE: MIXED

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



Folder: `run-0009__task-3.3__ref-R9__20260709T090009Z`
