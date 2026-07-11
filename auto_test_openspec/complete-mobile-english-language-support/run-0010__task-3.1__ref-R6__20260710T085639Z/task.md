# Task 3.1 locale state validation

- Change: `complete-mobile-english-language-support`
- Run: `#10`
- Task: `3.1`
- Ref: `R6`
- Scope: `MIXED`

`run.sh`/`run.bat` only starts a fresh H5 development server at `http://127.0.0.1:5174` with workspace-source aliases and dependency refresh.

Supervisor CLI commands:

```bash
./node_modules/.bin/vitest run apps/mobile/src/stores/app-store.spec.ts apps/mobile/src/i18n/navigation.spec.ts apps/mobile/src/i18n/catalog.spec.ts
pnpm --filter @community-map/mobile typecheck
pnpm --filter @community-map/shared typecheck
```

The 27 focused tests are the authoritative preparation for absent/valid/invalid local storage, authenticated `zh/en/absent`, Chinese/English device locale, synchronization success/failure, title updates, tab-route updates, non-tab rejection absorption, and catalog parity. No browser script or secret is used. GUI execution follows `tests/gui_runbook_locale_state.md` with MCP only.
