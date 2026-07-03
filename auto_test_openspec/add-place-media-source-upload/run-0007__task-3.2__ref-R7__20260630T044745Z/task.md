# Validation Bundle: Task 3.2

- change-id: add-place-media-source-upload
- run: 0007
- task-id: 3.2
- ref-id: R7
- scope: MIXED

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

The scripts start API and Admin for GUI validation and print the Admin URL. GUI steps are MCP-only and documented in `tests/gui_runbook_admin_direct_gallery_upload.md`.

## Expected Results

CLI acceptance is covered by Admin typecheck and API upload tests in the final bundle. GUI acceptance passes when the place editor blocks upload before save, uploads a selected image for a saved place, shows uploaded file ids separately from external media, and refreshes gallery state.
