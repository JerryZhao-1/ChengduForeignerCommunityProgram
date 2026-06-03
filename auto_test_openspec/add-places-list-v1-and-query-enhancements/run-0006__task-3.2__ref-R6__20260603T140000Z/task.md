# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0006`
- task-id: `3.2`
- ref-id: `R6`
- scope: `MIXED`

## Purpose

Validate build safety for the home page places entry and record the manual GUI runbook for entry behavior.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0006__task-3.2__ref-R6__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0006__task-3.2__ref-R6__20260603T140000Z/run.bat`

## Expected CLI Results

- The script exits with code `0`
- `@community-map/mobile` typecheck passes

## Manual Or MCP GUI Runbook

- Open the home page
- Verify the main Places action navigates to `/pages/places/index`
- Verify the recommended Places action navigates to `/pages/places/index?recommended=true&sort=recommended`
- Verify preview items remain visible
- Verify tapping a preview item opens `/pages/places/detail?id=<place-id>`
- Verify the section no longer presents Places as a placeholder or reserved module

