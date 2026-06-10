# Validation Bundle: Task 1.2 Share Behavior

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0002
- task-id: 1.2
- ref-id: R2
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

Use `tests/gui_runbook_share_behavior.md`. Expected result: place detail exposes a share action, Mini Program sharing uses the detail page path for the same place, and unsupported surfaces show production copy such as link copied or system share guidance.
