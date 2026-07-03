# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0003
- task-id: 2.1
- ref-id: R3
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

Checks Koa admin place edit and delete routes, including authorized update, validation failure, missing id, unauthorized edit/delete, successful delete, repeat delete, envelope status codes, and public visibility after update/delete.

## Expected Results

- `pnpm exec vitest run apps/api/test/app.spec.ts` exits 0.
- `pnpm --filter @community-map/api typecheck` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

