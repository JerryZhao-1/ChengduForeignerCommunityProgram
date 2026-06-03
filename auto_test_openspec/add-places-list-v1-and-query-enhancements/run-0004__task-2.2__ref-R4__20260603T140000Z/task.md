# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0004`
- task-id: `2.2`
- ref-id: `R4`
- scope: `CLI`

## Purpose

Validate public places list visibility, filtering, sorting, pagination, and validation parity across Koa and CloudBase handler paths.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0004__task-2.2__ref-R4__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0004__task-2.2__ref-R4__20260603T140000Z/run.bat`

## Expected Results

- The script exits with code `0`
- Route and CloudBase tests cover keyword, category, recommended, sort, pagination, unpublished exclusion, and invalid query validation
- Public list responses do not expose draft places or detail-only fields

