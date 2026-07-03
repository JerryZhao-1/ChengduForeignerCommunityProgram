# Validation Bundle: Task 3.1

- change-id: add-place-media-source-upload
- run: 0006
- task-id: 3.1
- ref-id: R6
- scope: MIXED

## How To Run

macOS/Linux: `./run.sh`
Windows: `run.bat`

The scripts start API and Admin for GUI validation and print the Admin URL. GUI steps are MCP-only and documented in `tests/gui_runbook_admin_amap_external_media.md`.

## Expected Results

CLI acceptance is covered by Admin typecheck and shared/API tests in the final bundle. GUI acceptance passes when the runbook screenshots/states show Amap image search, source labels, selecting cover/gallery media, and removing an external reference without changing unrelated fields.
