# Validation Bundle: Task 2.2

- change-id: add-place-media-source-upload
- run: 0004
- task-id: 2.2
- ref-id: R4
- scope: CLI

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

## Expected Results

The script runs shared/API typechecks and route/provider tests. It passes when external gallery and cover source save/remove flows validate, unsupported sources fail, `gallery_file_ids` are preserved, detail returns attribution, and list/marker payloads exclude external fields.
