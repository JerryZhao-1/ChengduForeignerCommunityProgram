# Production Readiness Acceptance - Task 1.1 Validation

- change-id: production-readiness-acceptance
- run: RUN #1
- task-id: 1.1
- ref-id: R1
- scope: CLI

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Both scripts can be launched from any working directory. They resolve the repository root from this bundle path, run the root quality gate, and write command logs under `logs/`.

## Commands Covered

- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm lint`

## Expected Results

- Each command exits with code `0`.
- `logs/typecheck.log`, `logs/test.log`, and `logs/lint.log` are created.
- The test log does not contain the previously blocking Discover ordering failure:
  - `filters public posts and creates posts with deterministic visible state`
  - `enforces public visibility and actor ownership in the shared mock service`
- The lint log does not contain the previous unused variable failure:
  - `_input is assigned a value but never used`

## Provenance

Expected results are derived from task 1.1 ACCEPT criteria and the local failures observed before the code fix. The scripts use `corepack pnpm` to honor the repository-pinned package manager.
