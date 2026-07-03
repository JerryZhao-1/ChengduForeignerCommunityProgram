# Validation Bundle: Task 2.1

- change-id: add-place-media-source-upload
- run: 0003
- task-id: 2.1
- ref-id: R3
- scope: CLI

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected Results

The script runs API typecheck and API route tests. It passes when mocked Amap upstream photos, no-photo candidates, missing credentials, upstream failures, invalid authorization, and Tencent search regression tests exit 0.
