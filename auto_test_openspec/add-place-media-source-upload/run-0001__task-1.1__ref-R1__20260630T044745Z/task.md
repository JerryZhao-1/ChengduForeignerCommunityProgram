# Validation Bundle: Task 1.1

- change-id: add-place-media-source-upload
- run: 0001
- task-id: 1.1
- ref-id: R1
- scope: CLI

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected Results

The script runs shared typecheck and shared contract tests. It passes when both commands exit 0 and logs are written under `logs/`.

## Provenance

Assertions are derived from task ACCEPT/TEST: external Amap media parses, unsupported sources fail, defaults keep existing place fixtures valid, detail exposes external fields, and list payloads omit detail-only media fields.
