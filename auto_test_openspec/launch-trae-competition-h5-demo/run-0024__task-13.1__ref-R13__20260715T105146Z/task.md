# No-model API, guest security, and privacy validation (R13)

- Change: `launch-trae-competition-h5-demo`
- Run: `0024`
- Task: `13.1`
- Ref: `R13`
- Scope: `CLI`
- HEAD short: `6543f9e9` (last commit at validation time; this run's working-tree change is the added privacy-safe log assertion in `apps/api/test/community-plan.spec.ts`, uncommitted)
- Branch: `competition/trae-h5-demo`
- Provenance: Supervisor CLI verification of R13 (no-model API, provider matcher wiring, guest authorization, rate limiter, strict Zod, unified envelope, privacy-safe logging, CORS `x-guest-mode`, Places field-boundary isolation). Companion to R10 (S07A), R11 (S07B), R12 (S07C) CLI gates; does not duplicate R17 consolidated gate. Closes the privacy-safe log-field assertion gap left by worker bundle run-0012.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0024__task-13.1__ref-R13__20260715T105146Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0024__task-13.1__ref-R13__20260715T105146Z\run.bat`
- Both scripts resolve the repository from their own directory. The Windows script was inspected for parity but not executed on this macOS validation host.

## Inputs, outputs, and expected result

- Input: the current worktree (with the added `emits a privacy-safe generation log with only allowed fields` test in `apps/api/test/community-plan.spec.ts`), the active OpenSpec change, the versioned `tongzilin-curated-v1` catalog, and the shared matcher/fixtures.
- Output: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`.
- Expected:
  - `pnpm --filter @community-map/api typecheck` exits `0`.
  - `vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts` exits `0` with all tests passing (guest authorization, limiter, privacy-safe log fields, 576 provider profiles, strict schema, envelope, CloudBase provider behavior).
  - `vitest run packages/shared/test/community-plan-engine.spec.ts` exits `0` with all tests passing (missing curated data, no unrelated place substitution, safe projections).
  - `eslint apps/api/test/community-plan.spec.ts` exits `0`.
  - `outputs/result.json` records the final decision (`pass`), exit codes, test counts, and the unchecked R18 boundary.

## Acceptance criteria (R13)

- All providers (mock, cloudbase live, deploy-fallback) call the shared `generateCommunityPlan(createCompetitionDemoEngineInput(input))` matcher; no model/LLM service call anywhere in `apps/api/src`.
- Only guest judge (`x-guest-mode: judge`, `authenticatedVia === "guest"`) can call `POST /community-plan/generate`; any other identity receives `403 FORBIDDEN`.
- Guest mutations except generation and public reads are all rejected with `403 FORBIDDEN` without provider mutation.
- Spoof-resistant 10-per-60-second limiter with 120-second bucket expiry, 10,000-bucket cap, and `API_TRUSTED_PROXY_IPS`-aware source resolution; 11th request returns `429 RATE_LIMITED` with `x-ratelimit-remaining: 0`.
- Strict Zod input (`NewResidentPreferenceSchema.strict()`); legacy arrays, unknown keys, PII, and `community_id` rejected with `400 VALIDATION_ERROR`.
- Unified success/error envelope validated by `ApiFailureResultSchema`.
- Generation log emits exactly `{ requestId, actor_kind, community_id, scenario_key, catalog_version, duration_ms, timestamp }`; excludes full preferences, `accessibility_need`, explanation copy, entity detail fields, and request body.
- CORS only adds the necessary `x-guest-mode` allow-header; CloudBase-managed CORS path unaffected.
- Places list/map/detail field boundaries remain unaffected (Community Plan route/providers are isolated).
- 576 provider profiles generate 576 plans with 576 unique `scenario_key` values.
- Missing curated place/event fails explicitly; matcher does not invent a route (covered by shared engine tests).

## Boundary

This run validates R13 only (no-model API, provider matcher wiring, guest security, limiter, strict Zod, envelope, privacy-safe logging, CORS, Places isolation). It does not provide:
- GUI acceptance (use the MCP runbook in R14/R16 for that).
- R12 curated catalog/matcher exhaustive coverage (run-0023 is the existing PASS).
- R15 provider/local parity gate (separate run).
- R17 consolidated CLI gate (run-0018 is the existing PASS).
- R18 independent public deployment or external online/offline acceptance.
- TRAE Session evidence. The S08 Session ID must be copied by the user from the TRAE UI into `docs/competition/trae-evidence-log.md`; this CLI run does not independently authenticate that UI evidence.
