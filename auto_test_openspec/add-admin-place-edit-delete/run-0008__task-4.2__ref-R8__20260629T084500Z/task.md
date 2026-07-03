# Validation Bundle

- change-id: add-admin-place-edit-delete
- run: 0008
- task-id: 4.2
- ref-id: R8
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

Runs final validation for the OpenSpec change, affected documentation files, workspace typechecks, and full Vitest regression coverage.

## Expected Results

- `openspec validate add-admin-place-edit-delete --strict --no-interactive` exits 0.
- Documentation files exist at `docs/API接口使用手册.md`, `docs/已实现API接口清单.md`, and `docs/openapi/community-map-api.openapi.yaml`.
- `pnpm typecheck` exits 0.
- `pnpm test` exits 0.
- Console output and full command transcript are written to `logs/run.log`.

