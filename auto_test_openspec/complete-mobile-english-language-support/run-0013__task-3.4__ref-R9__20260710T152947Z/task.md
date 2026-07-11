# Task 3.4 remaining Mobile English journey validation

- Change: `complete-mobile-english-language-support`
- Run: `#13`
- Task: `3.4`
- Ref: `R9`
- Scope: `MIXED`

`run.sh`/`run.bat` only starts the default mock H5 server at `http://127.0.0.1:5174`.

Supervisor CLI commands:

```bash
pnpm exec vitest run apps/mobile/src/i18n/catalog.spec.ts apps/mobile/src/i18n/navigation.spec.ts apps/mobile/src/pages/discover/enforcement-error.spec.ts apps/mobile/src/pages/more/notification-presentation.spec.ts apps/mobile/src/pages/more/registration-presentation.spec.ts apps/api/test/bilingual-preferences.spec.ts apps/api/test/app.spec.ts packages/shared/test/bilingual-contracts.spec.ts packages/shared/test/client.spec.ts
pnpm --filter @community-map/mobile typecheck
rg -n "import \\{ appCopy \\}|appCopy\\[state\\.locale\\]|[\\p{Han}]" apps/mobile/src/pages/discover apps/mobile/src/pages/more --glob '*.vue' --glob '!*.spec.ts'
```

The final scan is expected to return no matches (exit 1). Route-accountability is asserted by `navigation.spec.ts`, which compares every `pages.json` path against centralized route-title metadata.

Mock fixtures:

- Actor `user_001`: authenticated Me/Profile, registrations `reg_001` and `reg_full_001`, unread bilingual `notification_001`.
- Discover `post_001`: Chinese UGC and Chinese comment retained unchanged while system labels render in English.
- Feed contains both Chinese and English UGC, media variants, language badges, and social metadata.
- Empty follows list and unauthenticated login route cover intentional empty/auth presentation.

Failure, ownership, report, follow, auth, and client-envelope behavior is covered by the focused API/shared tests. GUI execution is MCP-only via `tests/gui_runbook_remaining_mobile_english.md`.
