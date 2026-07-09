# Task 3.2 - Places Navigation And Map Fallback

Change: `production-readiness-acceptance`

Reference: `#R5`

Scope: GUI

This bundle validates the Places map/detail navigation acceptance path. CLI checks cover helper behavior; final platform acceptance requires WeChat DevTools or true-device screenshots and logs.

## CLI Checks

Run from the repository root:

```bash
corepack pnpm --filter @community-map/mobile typecheck
./node_modules/.bin/vitest run apps/mobile/src/pages/places/navigation.spec.ts
node auto_test_openspec/production-readiness-acceptance/run-0005__task-3.2__ref-R5__20260709T080951Z/tests/test_cli_places_navigation_static.mjs
```

## GUI Runbook

Use `tests/gui_runbook_places_navigation.md`.

Evidence must be saved under this run folder's `outputs/`.

