# Validation Bundle: Task 2.1 Native Navigation Helper

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0003
- task-id: 2.1
- ref-id: R3
- scope: MIXED

## How To Run

Run `./run.sh` or `run.bat` to start Mobile H5 at `http://127.0.0.1:5174/`.

## CLI Checks

Run separately and record output under `logs/`:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/pages/places/navigation.spec.ts
```

## GUI Evidence

Use `tests/gui_runbook_navigation.md`. Expected result: detail and map navigation actions use consistent feedback, valid coordinates launch native location where supported, and failure does not unload the page.
