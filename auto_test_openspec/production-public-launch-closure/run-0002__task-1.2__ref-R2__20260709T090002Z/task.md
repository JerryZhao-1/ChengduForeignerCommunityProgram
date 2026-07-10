# Produce the detailed human Mini Program public launch manual under docs

change-id: `production-public-launch-closure`
run: `0002`
task-id: `1.2`
ref-id: `R2`
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



Folder: `run-0002__task-1.2__ref-R2__20260709T090002Z`
