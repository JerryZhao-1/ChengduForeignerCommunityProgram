# Validation Bundle: Task 3.1 Copy Cleanup

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0005
- task-id: 3.1
- ref-id: R5
- scope: MIXED

## How To Run

Run `./run.sh` or `run.bat` to start Mobile H5 at `http://127.0.0.1:5174/`.

## CLI Checks

Run separately and record output under `logs/`:

```bash
pnpm --filter @community-map/mobile typecheck
rg -n "pending|reserved|placeholder|预留|后续版本|入口|Favorite entry|Share entry|Recommended entry" apps/mobile/src/pages/places apps/mobile/src/pages.json
```

Expected CLI result: typecheck exits zero; the copy scan does not report visible places copy. Matches for source-only APIs or HTML attributes must be reviewed and recorded.

## GUI Evidence

Use `tests/gui_runbook_copy_cleanup.md`.
