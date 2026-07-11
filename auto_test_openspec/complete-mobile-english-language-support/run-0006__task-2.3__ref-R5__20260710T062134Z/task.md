# Task 2.3 Admin bilingual readiness validation (Node 24 compatibility run)

- Change: `complete-mobile-english-language-support`
- Run: `#6`
- Task: `2.3`
- Ref: `R5`
- Scope: `MIXED`

Run `./run.sh` or `run.bat`. The scripts are start-server only and print API `http://127.0.0.1:8787` and Admin `http://localhost:5173`; the API uses the repository-documented Node 24 compatibility option.

Before service start, the Supervisor executes from the repository root and records:

```bash
pnpm --filter @community-map/admin typecheck
./node_modules/.bin/vitest run apps/api/test/bilingual-publication-guards.spec.ts packages/shared/test/bilingual-contracts.spec.ts
```

No seed is needed. Use the fresh mock fixtures and create incomplete drafts through the Admin UI. GUI work is MCP-only per `tests/gui_runbook_admin_bilingual_readiness.md`; no executable browser script or manual interaction is allowed. Save screenshots to `outputs/screenshots/` and index URL, record title/id, assertion, and result in `logs/screenshots-index.md`.

Expected: bilingual Event addresses and readiness diagnostics are visible; incomplete Event/Place drafts save; publication is blocked with exact fields; complete publication succeeds; pending controls prevent duplicate action; feedback is readable. Expected behavior derives from R5 ACCEPT.
