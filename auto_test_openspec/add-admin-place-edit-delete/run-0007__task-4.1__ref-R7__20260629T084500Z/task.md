# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0007
- task-id: 4.1
- ref-id: R7
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

Checks backend regressions for published edit propagation, draft hiding, delete absence, public list and marker field boundaries, detail visibility, and stable envelope behavior.

## Expected Results

- `pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts packages/shared/test/places-admin-lifecycle.spec.ts` exits 0.
- Shared and API typechecks exit 0.
- Console output and full command transcript are written to `logs/run.log`.

