# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0005
- task-id: 3.1
- ref-id: R5
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

Checks mock service/provider place update preservation, explicit nullable and array replacement, successful delete, missing/repeat delete, and immutability after failed route-level validation or authorization.

## Expected Results

- `pnpm exec vitest run packages/shared/test/places-admin-lifecycle.spec.ts apps/api/test/app.spec.ts` exits 0.
- Shared and API typechecks exit 0.
- Console output and full command transcript are written to `logs/run.log`.

