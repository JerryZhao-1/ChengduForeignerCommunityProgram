# Validation Bundle: Task 1.1 Favorite State

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0001
- task-id: 1.1
- ref-id: R1
- scope: MIXED

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

The scripts only start the Mobile H5 service at `http://127.0.0.1:5174/`.

## CLI Checks

Run separately and record output under `logs/`:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/pages/places/favorite-state.spec.ts
```

## GUI Evidence

Use `tests/gui_runbook_favorite_state.md` with MCP browser tooling. Expected result: the detail favorite button toggles between saved and unsaved visible states and no user-facing copy says pending, reserved, placeholder, or future implementation.
