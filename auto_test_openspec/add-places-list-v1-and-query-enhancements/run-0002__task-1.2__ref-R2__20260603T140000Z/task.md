# Validation Task

- change-id: `add-places-list-v1-and-query-enhancements`
- run#: `0002`
- task-id: `1.2`
- ref-id: `R2`
- scope: `CLI`

## Purpose

Validate shared test coverage for places list query normalization and list-card payload boundaries.

## How To Run

- macOS/Linux: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0002__task-1.2__ref-R2__20260603T140000Z/run.sh`
- Windows: `auto_test_openspec/add-places-list-v1-and-query-enhancements/run-0002__task-1.2__ref-R2__20260603T140000Z/run.bat`

## Expected Results

- The script exits with code `0`
- Shared Vitest coverage includes positive query parsing assertions for `page`, `pageSize`, `communityId`, `keyword`, `category`, `recommended`, and `sort`
- Shared Vitest coverage includes negative list payload boundary assertions for detail-only fields

