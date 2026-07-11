# Task 3.2 Home and Events English journey validation

- Change: `complete-mobile-english-language-support`
- Run: `#11`
- Task: `3.2`
- Ref: `R7`
- Scope: `MIXED`

`run.sh`/`run.bat` only starts fresh mock H5 and Admin development servers and prints their URLs. No seed or external credential is required. The mock Admin accepts non-sensitive local values on its login screen.

Supervisor CLI commands:

```bash
./node_modules/.bin/vitest run apps/mobile/src/i18n/catalog.spec.ts apps/mobile/src/pages/events/event-presentation.spec.ts apps/mobile/src/pages/events/event-signup-state.spec.ts
pnpm --filter @community-map/mobile typecheck
pnpm --filter @community-map/admin typecheck
```

Fixture coverage: `user_001` + `event_001` is already registered with a ticket and complete bilingual content; the isolated `user_002` H5 instance exercises eligible registration, validation, successful submission, and ticket creation; `event_full` covers full capacity; `event_closed` covers deadline/ended protection; unit matrices cover unavailable, legacy address fallback and failed submission. GUI execution is MCP-only per `tests/gui_runbook_home_events_english.md`.
