# Validation Bundle: launch-discover-social-ops / task 1.2 / R2

- change-id: launch-discover-social-ops
- run: RUN #2
- task-id: 1.2
- ref-id: R2
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/launch-discover-social-ops/run-0002__task-1.2__ref-R2__20260708T161007Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-discover-social-ops\run-0002__task-1.2__ref-R2__20260708T161007Z\run.bat
```

## Inputs

No external input files are required. The validation uses repository source files, mock data, and Vitest in-memory HTTP/CloudBase provider fixtures.

## Outputs

- `logs/vitest-social-provider.log`: command transcript for API/provider social interaction tests.

## Expected Results

- `./node_modules/.bin/vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits with code 0.
- stdout includes `apps/api/test/integration-readiness.spec.ts` and `apps/api/test/cloudbase.spec.ts`.
- The test run covers idempotent like/favorite updates, share count incrementing, hidden post rejection, unauthorized actor rejection, and CloudBase collection persistence.

## Provenance

Expected results are derived from task 1.2 ACCEPT criteria: mock and CloudBase providers persist interaction records and denormalized counters consistently across refreshes.
