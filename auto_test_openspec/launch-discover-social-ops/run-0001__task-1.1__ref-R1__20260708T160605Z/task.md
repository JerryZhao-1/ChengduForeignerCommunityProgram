# Validation Bundle: launch-discover-social-ops / task 1.1 / R1

- change-id: launch-discover-social-ops
- run: RUN #1
- task-id: 1.1
- ref-id: R1
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/launch-discover-social-ops/run-0001__task-1.1__ref-R1__20260708T160605Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-discover-social-ops\run-0001__task-1.1__ref-R1__20260708T160605Z\run.bat
```

## Inputs

No external input files are required. The validation uses repository source files and existing Vitest fixtures.

## Outputs

- `logs/vitest-shared-contracts.log`: command transcript for the focused shared contract and client tests.

## Expected Results

- `./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits with code 0.
- stdout includes both focused test files.
- stderr/stdout must not include a Vitest failure summary.

## Provenance

Expected results are derived from task 1.1 ACCEPT criteria: shared contracts support idempotent like/unlike, favorite/unfavorite, share count recording, and actor-specific interaction state.
