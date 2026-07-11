# Task 3.1 locale state validation (forced dependency refresh)

- Change: `complete-mobile-english-language-support`
- Run: `#9`
- Task: `3.1`
- Ref: `R6`
- Scope: `MIXED`

Run `./run.sh` or `run.bat`; scripts only start H5 at `http://localhost:5174` with forced Vite dependency re-optimization and the Node-24-compatible API at `http://127.0.0.1:8787`.

Supervisor CLI checks are the 23 focused locale/navigation/catalog tests, Mobile typecheck, and no-match hard-coded `preferred_language: "zh"` scan documented in run 8. No seed is needed.

Use browser MCP only with `tests/gui_runbook_locale_state.md`. Save screenshots in `outputs/screenshots/` and index URL, active locale, selector, tab/title, persistence, synchronization status, and console errors in `logs/screenshots-index.md`.

Expected: explicit Chinese/English options; immediate copy/title/tab update; English survives reload; focused tests decide invalid storage/device/server/offline matrices; authenticated mock sync succeeds without a hard-coded Chinese override.
