# Add production artifact scan for forbidden endpoints fixtures and mock headers

change-id: `production-public-launch-closure`
run: `0016`
task-id: `2.2`
ref-id: `R5`
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



Folder: `run-0016__task-2.2__ref-R5__20260710T032120Z`
