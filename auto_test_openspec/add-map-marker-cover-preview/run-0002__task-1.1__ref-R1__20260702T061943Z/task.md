# Validation Bundle: add-map-marker-cover-preview R1

- change-id: add-map-marker-cover-preview
- run: run-0002
- task-id: 1.1
- ref-id: R1
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0002__task-1.1__ref-R1__20260702T061943Z/run.sh
```

Windows:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0002__task-1.1__ref-R1__20260702T061943Z\run.bat
```

## Test Inputs

The bundle uses repository source and test fixtures only. No separate input files are required.

## Test Outputs

- `logs/shared-marker-contract.log`: Vitest output for the focused shared marker contract tests.

## Expected Results

- `./node_modules/.bin/vitest run packages/shared/test/places-marker-contract.spec.ts packages/shared/test/contracts.spec.ts` exits with code 0.
- The tests assert `PlaceMapMarkerSchema` preserves nullable `cover_url`.
- The tests assert marker parsing strips forbidden detail/media fields: address bodies, intro bodies, gallery arrays, external media arrays, cover source metadata, and navigation objects.

## Provenance

Expected results are derived from the task ACCEPT block and the OpenSpec public marker contract delta. This run supersedes run-0001 for R1 because run-0001 stopped before test execution when `pnpm exec` attempted dependency approval checks.
