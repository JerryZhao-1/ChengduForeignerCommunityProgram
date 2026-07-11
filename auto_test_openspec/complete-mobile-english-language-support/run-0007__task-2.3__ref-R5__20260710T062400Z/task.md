# Task 2.3 Admin bilingual readiness validation (mock Admin)

- Change: `complete-mobile-english-language-support`
- Run: `#7`
- Task: `2.3`
- Ref: `R5`
- Scope: `MIXED`

Run `./run.sh` or `run.bat`; scripts only start the Node-24-compatible API at `http://127.0.0.1:8787` and default mock Admin at `http://localhost:5173` and print both URLs. The Admin uses its documented default mock client so no credentials or secrets are embedded.

Supervisor CLI checks, already reproducible from repository root:

```bash
pnpm --filter @community-map/admin typecheck
./node_modules/.bin/vitest run apps/api/test/bilingual-publication-guards.spec.ts packages/shared/test/bilingual-contracts.spec.ts
```

No seed is required. In the mock Admin login screen, any non-empty local-only username/password values exercise the mock session without transmitting credentials to an external service. GUI execution is MCP-only per `tests/gui_runbook_admin_bilingual_readiness.md`. Save screenshots under `outputs/screenshots/` and create `logs/screenshots-index.md` with URLs, records, assertions, results, and console errors.

Expected: bilingual Event address inputs and field diagnostics; incomplete Event/Place draft saves; publish controls blocked with exact missing fields; complete publication succeeds; pending controls protect duplicate actions; feedback is readable. Expected behavior comes from R5 ACCEPT.
