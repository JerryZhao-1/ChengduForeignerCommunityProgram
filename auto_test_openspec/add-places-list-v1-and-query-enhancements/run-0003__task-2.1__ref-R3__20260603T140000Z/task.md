# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0003`
- task-id: `2.1`
- ref-id: `R3`
- scope: `CLI`

## Purpose

Validate provider-level and API-level places list behavior for the v1 public list truth.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0003__task-2.1__ref-R3__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0003__task-2.1__ref-R3__20260603T140000Z/run.bat`

## Expected Results

- The script exits with code `0`
- Provider and route tests confirm keyword, category, recommended, sort, page, and pageSize behavior
- List responses keep stable `items`, `page`, `pageSize`, and `total` envelopes

