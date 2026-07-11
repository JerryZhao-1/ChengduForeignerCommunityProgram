# Task 2.3 Admin bilingual readiness validation

- Change: `complete-mobile-english-language-support`
- Run: `#5`
- Task: `2.3`
- Ref: `R5`
- Scope: `MIXED`

## Service start

- macOS/Linux: `./run.sh`
- Windows: `run.bat`

The start scripts only launch the mock API and Admin HTTP-mode development server and print `http://127.0.0.1:8787` and `http://localhost:5173`. Stop with Ctrl+C.

## Exact preparation and CLI checks

From the repository root, before starting services:

```bash
pnpm --filter @community-map/admin typecheck
./node_modules/.bin/vitest run apps/api/test/bilingual-publication-guards.spec.ts packages/shared/test/bilingual-contracts.spec.ts
```

No seed command is required. A fresh mock API contains complete published Event/Place fixtures. The MCP runbook creates incomplete draft records through the Admin UI so ids are captured in evidence rather than hard-coded.

## MCP-only GUI execution

Follow `tests/gui_runbook_admin_bilingual_readiness.md` using the browser MCP only. Do not use executable browser scripts or manual interaction. Save screenshots under `outputs/screenshots/` and record their paths, URLs, created ids/titles, and assertions in `logs/screenshots-index.md`.

## Expected results

- Event table/form show exact bilingual readiness fields, including both address locales.
- Incomplete Event and Place drafts save and appear with missing-field/placeholder diagnostics.
- Publish controls are disabled or block with actionable field names.
- Complete mock records can execute publication actions successfully.
- Mutation controls expose pending/disabled states and readable success/error feedback.
- CLI commands exit zero.

The expected behavior is derived from R5 ACCEPT and does not require external services or credentials.
