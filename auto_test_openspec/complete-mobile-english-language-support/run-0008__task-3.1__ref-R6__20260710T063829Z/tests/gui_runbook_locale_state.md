# MCP-only locale state runbook

Use browser MCP only; refresh the accessibility snapshot before each interaction.

1. Open `http://localhost:5174/#/pages/more/language-settings`.
2. Assert two explicit radio-like options labeled `中文` and `English`; capture Chinese/default state.
3. Select `English`; assert current page title/caption changes immediately, English is selected, and all five tabs read Home, Events, Discover, Places, Me. Capture evidence.
4. Navigate to Home, Events, and Places through visible tabs or direct known routes. Assert runtime navigation/title and visible catalog copy use English.
5. Reload the application and reopen Language. Assert English remains selected before interaction and tabs remain English. Capture persistence evidence.
6. Select `中文`; assert immediate Chinese page copy and five Chinese tab labels. Capture Chinese regression evidence.
7. Record CLI precedence/offline cases as the authoritative evidence for invalid storage, English-device first launch, server preference, and sync failure; browser storage mutation scripts are forbidden.
8. Save screenshots in `outputs/screenshots/` and write `logs/screenshots-index.md` with URL, active locale, title/tab assertions, persistence state, and console errors.
