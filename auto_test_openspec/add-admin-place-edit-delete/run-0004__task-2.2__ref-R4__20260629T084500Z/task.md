# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0004
- task-id: 2.2
- ref-id: R4
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

Checks CloudBase compatibility handler parity for `DELETE /admin/places/:id` and `/api/admin/places/:id`, including authorization, missing id behavior, success envelope, and unchanged prefixed PATCH behavior.

## Expected Results

- `pnpm exec vitest run apps/api/test/cloudbase.spec.ts` exits 0.
- `pnpm --filter @community-map/api typecheck` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

