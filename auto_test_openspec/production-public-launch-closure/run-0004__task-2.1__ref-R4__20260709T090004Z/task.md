# Harden Mini Program public-review build configuration

change-id: `production-public-launch-closure`
run: `0004`
task-id: `2.1`
ref-id: `R4`
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



Folder: `run-0004__task-2.1__ref-R4__20260709T090004Z`
