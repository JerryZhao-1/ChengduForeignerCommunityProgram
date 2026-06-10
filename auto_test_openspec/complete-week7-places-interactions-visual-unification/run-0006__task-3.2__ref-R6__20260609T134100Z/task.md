# Validation Bundle: Task 3.2 Visual Unification

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0006
- task-id: 3.2
- ref-id: R6
- scope: MIXED

## How To Run

Run `./run.sh` or `run.bat` to start Mobile H5 at `http://127.0.0.1:5174/`.

## CLI Checks

Run separately and record output under `logs/`:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts
```

## GUI Evidence

Use `tests/gui_runbook_visual_unification.md`. Expected result: list, map, detail, recommendation, loading, empty, and error states use consistent places action, chip, badge, card, and feedback styling with no text overlap.
