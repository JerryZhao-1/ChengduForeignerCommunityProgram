# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0001`
- task-id: `1.1`
- ref-id: `R1`
- scope: `CLI`

## Purpose

Validate the shared public places list query contract and card-oriented list item boundary.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0001__task-1.1__ref-R1__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0001__task-1.1__ref-R1__20260603T140000Z/run.bat`

## Expected Results

- The script exits with code `0`
- Shared contract tests confirm supported query inputs, default pagination, sort enum validation, and list item field boundaries
- List item parsing does not treat detail-only fields such as `gallery_urls`, `navigation`, or full address fields as list output truth

