# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0006
- task-id: 3.2
- ref-id: R6
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

Checks CloudBase provider update and delete persistence semantics, including load-before-write, schema validation before update, no duplicate `set` during update/delete, normalized delete response, and missing delete behavior.

## Expected Results

- `pnpm exec vitest run apps/api/test/cloudbase.spec.ts` exits 0.
- `pnpm --filter @community-map/api typecheck` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

