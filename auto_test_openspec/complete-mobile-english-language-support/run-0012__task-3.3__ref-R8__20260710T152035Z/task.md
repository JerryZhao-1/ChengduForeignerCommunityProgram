# Task 3.3 Places English journey validation

- Change: `complete-mobile-english-language-support`
- Run: `#12`
- Task: `3.3`
- Ref: `R8`
- Scope: `MIXED`

`run.sh`/`run.bat` only starts the default mock H5 server at `http://127.0.0.1:5174`.

Supervisor CLI commands:

```bash
./node_modules/.bin/vitest run apps/mobile/src/i18n/catalog.spec.ts apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts apps/mobile/src/pages/places/place-presentation.spec.ts packages/shared/test/places-marker-contract.spec.ts packages/shared/test/client.spec.ts
pnpm --filter @community-map/mobile typecheck
rg -n "mobileApi\.places\.detail" apps/mobile/src/pages/places/map.vue
```

The final `rg` command is expected to return no matches (exit 1), proving map summary rendering has no detail client call. GUI execution is MCP-only via `tests/gui_runbook_places_english.md`. Fixtures: `place_001` (recommended, media, navigation/share/favorite), `place_002` (recommended), shared marker-contract fixtures, and presentation unit fixtures for missing-English fallback.
