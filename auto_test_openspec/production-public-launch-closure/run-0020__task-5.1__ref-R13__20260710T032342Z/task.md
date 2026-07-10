# Run full source build spec validation gate for launch closure

change-id: `production-public-launch-closure`
run: `0020`
task-id: `5.1`
ref-id: `R13`
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



Folder: `run-0020__task-5.1__ref-R13__20260710T032342Z`
