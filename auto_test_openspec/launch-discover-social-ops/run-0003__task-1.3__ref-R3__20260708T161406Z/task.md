# Validation Bundle: launch-discover-social-ops / task 1.3 / R3

- change-id: launch-discover-social-ops
- run: RUN #3
- task-id: 1.3
- ref-id: R3
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/launch-discover-social-ops/run-0003__task-1.3__ref-R3__20260708T161406Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-discover-social-ops\run-0003__task-1.3__ref-R3__20260708T161406Z\run.bat
```

## Inputs

No external input files are required. The validation uses repository source files, mock data, and Vitest in-memory API fixtures.

## Outputs

- `logs/vitest-profile-follow.log`: command transcript for profile/follow contract and API tests.

## Expected Results

- `./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts` exits with code 0.
- stdout includes shared contract/client tests and API integration readiness tests.
- The tests cover public profile reads, visible author posts, follow/unfollow idempotency, counts, unavailable profiles, unauthorized actors, and self-follow rejection.

## Provenance

Expected results are derived from task 1.3 ACCEPT criteria: API supports follow/unfollow and public profile reads with posts, video posts, counts, followed state, and safe unavailable-profile states.
