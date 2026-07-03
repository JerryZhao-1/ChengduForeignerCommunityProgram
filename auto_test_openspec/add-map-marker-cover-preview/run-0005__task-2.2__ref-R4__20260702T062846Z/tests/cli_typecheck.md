# CLI Typecheck

Run from the repository root:

```bash
corepack pnpm --filter @community-map/mobile typecheck > auto_test_openspec/add-map-marker-cover-preview/run-0005__task-2.2__ref-R4__20260702T062846Z/logs/mobile-typecheck.log 2>&1
```

Expected result:

- Exit code is 0.
- `logs/mobile-typecheck.log` does not contain TypeScript or Vue template errors.
