# Validation Bundle: Task 2.3

- change-id: add-place-media-source-upload
- run: 0005
- task-id: 2.3
- ref-id: R5
- scope: CLI

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected Results

The script runs API typecheck and API/cloudbase tests. It passes when direct upload creates an active public file asset, appends gallery order, resolves public detail media, rejects invalid uploads, denies non-admins, and preserves existing file endpoint compatibility.
