# Task 3.1 locale state and runtime navigation validation

- Change: `complete-mobile-english-language-support`
- Run: `#8`
- Task: `3.1`
- Ref: `R6`
- Scope: `MIXED`

Run `./run.sh` or `run.bat`; the scripts are start-server only and print H5 `http://localhost:5174` and API `http://127.0.0.1:8787`. H5 uses its default mock client; API is available for parity checks and uses the documented Node 24 option.

Supervisor CLI checks:

```bash
./node_modules/.bin/vitest run apps/mobile/src/stores/app-store.spec.ts apps/mobile/src/i18n/navigation.spec.ts apps/mobile/src/i18n/catalog.spec.ts
pnpm --filter @community-map/mobile typecheck
rg -n 'preferred_language:\s*"zh"' apps/mobile/src --glob '!**/*.spec.ts'
```

The tests cover stored `zh/en/invalid/absent`, server `zh/en/absent`, device Chinese/English/other, sync success/failure, authenticated/unauthenticated behavior, all routes, and five tabs. No separate seed is required.

GUI is MCP-only per `tests/gui_runbook_locale_state.md`; no executable browser scripts or manual interaction. Capture screenshots under `outputs/screenshots/` and index them in `logs/screenshots-index.md`.

Expected: explicit `中文`/`English` choices; immediate current-page and tab/title update; English survives reload; invalid-storage/server/device precedence is machine-decided by focused tests; sync failure keeps local English; login has no hard-coded Chinese override.
