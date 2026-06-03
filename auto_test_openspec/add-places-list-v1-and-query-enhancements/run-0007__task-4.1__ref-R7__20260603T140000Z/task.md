# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0007`
- task-id: `4.1`
- ref-id: `R7`
- scope: `CLI`

## Purpose

Validate OpenSpec hygiene for the places list v1 and query enhancements change.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0007__task-4.1__ref-R7__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0007__task-4.1__ref-R7__20260603T140000Z/run.bat`

## Expected Results

- The script exits with code `0`
- `openspec validate add-places-list-v1-and-query-enhancements --strict --no-interactive` passes
- The change-local design document records the Figma URL, file key, and node id

