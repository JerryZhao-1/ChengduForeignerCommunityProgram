# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0005`
- task-id: `3.1`
- ref-id: `R5`
- scope: `MIXED`

## Purpose

Validate build safety for the mobile places list page and record the manual GUI runbook for list browsing behavior.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0005__task-3.1__ref-R5__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0005__task-3.1__ref-R5__20260603T140000Z/run.bat`

## Expected CLI Results

- The script exits with code `0`
- `@community-map/mobile` typecheck passes

## Manual Or MCP GUI Runbook

- Open `/pages/places/index`
- Verify real place cards render from the public list endpoint
- Verify keyword search refreshes the same list page
- Verify category switching refreshes the list using the selected category
- Verify the recommended entry applies `recommended=true&sort=recommended`
- Verify tapping a card navigates to the detail page
- Verify loading, empty, and error states remain available through the shared async state component

