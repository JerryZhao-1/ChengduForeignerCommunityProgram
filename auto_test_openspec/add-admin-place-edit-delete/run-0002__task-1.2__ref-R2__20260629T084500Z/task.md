# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0002
- task-id: 1.2
- ref-id: R2
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

Checks that admin place update remains a partial `PATCH /admin/places/:id` contract, invalid update field values are rejected by shared schemas, and shared clients still call the stable update path.

## Expected Results

- `pnpm exec vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits 0.
- `pnpm --filter @community-map/shared typecheck` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

