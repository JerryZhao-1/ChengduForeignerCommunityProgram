# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0001
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

## Coverage

Checks the shared admin delete contract, `DELETE` method support, path helper, delete response schema, HTTP client call shape, and shared type safety.

## Expected Results

- `pnpm exec vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits 0.
- `pnpm --filter @community-map/shared typecheck` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

