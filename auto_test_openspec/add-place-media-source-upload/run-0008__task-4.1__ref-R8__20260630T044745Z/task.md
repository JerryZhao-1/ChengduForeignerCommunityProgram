# Validation Bundle: Task 4.1

- change-id: add-place-media-source-upload
- run: 0008
- task-id: 4.1
- ref-id: R8
- scope: MIXED

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

The scripts start API and Mobile H5 for GUI validation and print the Mobile URL. GUI steps are MCP-only and documented in `tests/gui_runbook_mobile_external_media_detail.md`.

## Expected Results

CLI acceptance is covered by Mobile typecheck and shared/API public detail tests in the final bundle. GUI acceptance passes when owned-only, external-only, mixed media, external cover attribution, and broken external image fallback states are captured.
