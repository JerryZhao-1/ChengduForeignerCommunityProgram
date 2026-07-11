# MCP-only locale state runbook

1. Open `http://localhost:5174/#/pages/more/language-settings`; snapshot before every action.
2. Assert explicit `中文` and `English` radio-like options; capture initial state.
3. Select English; assert immediate English title/caption, selected option, no sync-pending warning in authenticated mock mode, and English tab labels on a tab page.
4. Open Home, Events, and Places tab routes; assert runtime titles and visible catalog copy are English.
5. Reload and reopen Language; assert English remains selected before interaction and tab labels remain English.
6. Select Chinese; assert immediate Chinese copy and Chinese tab labels.
7. Use the 23 focused tests as authoritative evidence for invalid storage, server/device precedence, English-device first launch, and failed-sync local stability; browser storage scripts are forbidden.
8. Store screenshots under `outputs/screenshots/`; write `logs/screenshots-index.md` with all assertions and console logs.
