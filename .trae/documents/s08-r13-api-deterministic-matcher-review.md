# Plan: S08 / R13 — No-model API, guest security, privacy review

## Summary

This session is the **S08** TRAE Builder review for **R13** (`launch-trae-competition-h5-demo` task 13.1: "Remove Community Plan model integration and use the shared matcher"). R13 was already marked `[x]` in `tasks.md`, but the worker bundle `run-0012` had **no supervisor verdict and no real outputs** — only a `logs/README.md` placeholder. At the start of this review, the S08 row in `docs/competition/trae-evidence-log.md` was `PENDING-TRAE-EVIDENCE`; the completed Session ID and captures are now recorded there.

Goal: review the existing AI-free deterministic implementation against every S08 acceptance criterion, close one genuine test gap (logging field assertion), run the required CLI gates, and produce a new immutable supervisor-verified run folder `run-0024`.

No unrelated refactoring. No AI/LLM runtime. No fabricated evidence.

## Current State Analysis (Phase 1 findings)

Verified against source in `apps/api/src/` and `packages/shared/`:

| Requirement | Status | Evidence |
|---|---|---|
| All providers call shared matcher, no model service | OK | mock (`providers/mock/index.ts`), cloudbase (`providers/cloudbase/index.ts` `createLiveCommunityPlanProvider`), deploy-fallback (`providers/cloudbase/deploy-fallback.ts`) all call `generateCommunityPlan(createCompetitionDemoEngineInput(input))`. Grep for openai/anthropic/hunyuan/deepseek/glm/kimi/minimax/llm/gpt in `apps/api/src` = zero hits. |
| Guest judge-only generation (others → 403) | OK | `routes/community-plan.ts` inline guard throws `FORBIDDEN` 403 when `authenticatedVia !== "guest"`. Test `rejects anonymous calls without the guest judge marker` asserts 401 for anonymous; non-guest authenticated callers hit the 403 guard. |
| Guest mutations except generation + public reads rejected | OK | `lib/auth.ts` `isGuestAllowedRoute` permits only `POST /community-plan/generate` plus anonymous public GETs; everything else → 403 `FORBIDDEN`. Test `denies every other guest mutation with 403` covers `POST /notifications/n_001/read`. |
| Spoof-resistant 10/60s limiter, 120s expiry, 10000 bucket cap | OK | `lib/community-plan-rate-limit.ts`: LIMIT=10, WINDOW_MS=60000, bucket TTL 120s, MAX_BUCKETS=10000, `resolveSource` honors `API_TRUSTED_PROXY_IPS` for XFF walk. Test `limits the eleventh guest generation request in one minute` asserts 11th → 429 with `x-ratelimit-remaining: 0`. |
| Strict Zod input | OK | `NewResidentPreferenceSchema` is `.strict()`; `parseOrThrow` → 400 `VALIDATION_ERROR` with `{ issues }`. Three tests cover legacy `interests` array, legacy `accessibility_needs` array, unknown `community_id`. |
| Unified success/error envelope | OK | `sendSuccess` → `{ success:true, data, requestId }`; `errorMiddleware` builds `{ success:false, error:{code,message,details}, requestId }` validated by `ApiFailureResultSchema`. |
| Logging fields correct | OK (impl) / GAP (test) | Route logs exactly `{requestId, actor_kind, community_id, scenario_key, catalog_version, duration_ms, timestamp}`. **No test asserts this.** run-0012 task.md claims coverage of "privacy-safe log fields" but no assertion exists. |
| CORS adds only necessary `x-guest-mode` | OK | `lib/http.ts` `corsMiddleware` allow-headers include `x-guest-mode` alongside existing headers; CloudBase-managed CORS path unaffected. |
| Places list/map/detail field boundaries unaffected | OK | Community Plan route/providers are isolated; no Places route or projection changes. Places boundaries covered by existing Places tests. |
| 576 provider profile | OK | Test `generates all 576 curated preferences through the provider` runs all scenarios through `provider.communityPlan.generate`, asserts 576 plans, 576 unique keys, catalog_version + 4 reasons. |
| Missing catalog | OK (shared) | `packages/shared/test/community-plan-engine.spec.ts` has `fails when curated data is missing`, `does not substitute an unrelated place when an interest category is missing`, `keeps only valid safe projections`. |

**Only one gap found:** no test asserts the `community_plan_generated` log fields (presence of the 7 allowed fields + absence of PII / preferences / accessibility_need / explanation / request body). The implementation is correct; this is a missing regression guard that the R13 worker bundle already claims.

## Proposed Changes

### 1. Add minimal logging assertion test

**File:** `apps/api/test/community-plan.spec.ts`

**What:** Add one new test inside the existing `describe("community-plan routes")` block that:
- Spies on `console.info` via `vi.spyOn(console, "info")` before a successful guest generation request.
- Performs the same guest `POST /community-plan/generate` call as the existing happy-path test (using `validPreference`).
- Asserts `console.info` was called once with first arg `"community_plan_generated"` and a JSON-stringifiable second arg.
- Parses the JSON second arg and asserts:
  - The set of keys equals exactly `{ requestId, actor_kind, community_id, scenario_key, catalog_version, duration_ms, timestamp }` (no more, no fewer).
  - `actor_kind === "guest"`.
  - `community_id === "tongzilin"`.
  - `scenario_key === "v1:community-service:first-week:solo:none"`.
  - `catalog_version === "tongzilin-curated-v1"`.
  - `typeof duration_ms === "number"`.
  - `typeof timestamp === "string"` (ISO).
- Asserts the serialized log string does NOT contain: `primary_interest`, `accessibility_need`, `arrival_context`, `household_type`, `preferred_language`, `selection_explanation`, `items`, `request body`, or any preference value (e.g. `community-service`, `first-week`, `solo`, `none` as free text beyond the scenario_key segments).
- Restores the spy in a `finally` block.

**Why:** Closes the R13 acceptance gap. The worker bundle run-0012 task.md explicitly lists "privacy-safe log fields" as covered, but no assertion existed. This is a necessary minimal fix, not unrelated refactoring.

**How (no type escapes):** Use `vi.spyOn(console, "info")` typed via Vitest; parse the second argument with `JSON.parse` into a `Record<string, unknown>` and assert via `Object.keys`. No `any`/`as any`/`@ts-ignore`.

### 2. Create new immutable validation run folder `run-0024`

**Path:** `auto_test_openspec/launch-trae-competition-h5-demo/run-0024__task-13.1__ref-R13__<UTC_TIMESTAMP>Z/`

(Next number after run-0023. Timestamp generated at creation time in `YYYYMMDDThhmmssZ`.)

**Contents (mirrors run-0023 structure):**
- `task.md` — R13 task description, acceptance criteria, how-to-run, inputs/outputs/expected, boundary.
- `run.sh` — start-server-only shell script (per `openspec/project.md` GUI/MIXED rule; this run is `SCOPE: CLI` so the script runs the CLI gates directly). Resolves repo dir from script location, runs: `pnpm --filter @community-map/api typecheck`, then `vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts`, then `vitest run packages/shared/test/community-plan-engine.spec.ts` (for missing-catalog coverage). Tees to `logs/run.log`.
- `run.bat` — Windows parity script (inspected for parity, not executed on macOS).
- `logs/run.log` — real captured output from running `run.sh`.
- `logs/vitest.json` — JUnit/JSON reporter output from the vitest run.
- `outputs/result.json` — machine-readable final decision, exit codes, test counts, HEAD commit, R18-still-unchecked boundary.
- `supervisor-verdict.md` — Supervisor PASS/FAIL verdict with evidence pointers and boundary statement.

**No existing run folder is modified.** run-0012 (the worker bundle) is preserved as-is per the evidence model.

### 3. No other source changes

- No changes to `apps/api/src/routes/community-plan.ts`, providers, `lib/auth.ts`, `lib/community-plan-rate-limit.ts`, `lib/http.ts`, or anything in `packages/shared/`.
- No changes to Places routes/projections/contracts.
- No new dependencies.

## Assumptions & Decisions

- **R13 stays `[x]` in tasks.md.** The task is already complete; this session produces the missing supervisor evidence, not a re-implementation.
- **Missing-catalog coverage** is provided by the shared engine test (`packages/shared/test/community-plan-engine.spec.ts`), run alongside the API tests. No API-level missing-catalog test is added (would require provider-injection plumbing not present in the current test harness; the shared test already proves the matcher fails explicitly on missing curated data).
- **Logging test is the only code change.** Per user decision (AskUserQuestion), add a minimal focused test rather than documenting as risk-only.
- **No type escapes:** `any`, `as any`, `@ts-ignore`, `@ts-nocheck` are forbidden per project memory; the test uses `Record<string, unknown>` and `JSON.parse`.
- **TRAE Session evidence** was subsequently captured from the live TRAE UI with Computer Use. The full Session ID is recorded in `docs/competition/trae-evidence-log.md`; raw screenshots and provenance are stored under `docs/competition/evidence/trae-sessions/S08/`.
- **Public URL / deployment status** remain PENDING (R18). This session does not touch R18.
- **Historical R1–R9 / old AI screenshots / existing run folders** are immutable superseded evidence; not modified.
- **`run.bat` parity** is inspected but not executed on this macOS host (consistent with run-0023 boundary).

## Verification steps

1. **Add the logging test** to `apps/api/test/community-plan.spec.ts`.
2. **Run API typecheck:** `pnpm --filter @community-map/api typecheck` → expect exit 0.
3. **Run API focused tests:** `pnpm exec vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts` → expect all pass (guest authorization, limiter, logging, 576 provider profile, strict schema, envelope).
4. **Run shared missing-catalog tests:** `pnpm exec vitest run packages/shared/test/community-plan-engine.spec.ts` → expect all pass (missing curated data, no substitution, safe projections).
5. **Run lint on the modified test file:** `pnpm exec eslint apps/api/test/community-plan.spec.ts` → expect 0 issues.
6. **Create run-0024 folder** with `task.md`, `run.sh`, `run.bat`; execute `run.sh` to capture real `logs/run.log`, `logs/vitest.json`; write `outputs/result.json` and `supervisor-verdict.md` from real results.
7. **Record git HEAD** at validation time; confirm R18 still unchecked; confirm no existing run folder modified.
8. **Final session output** (in chat, not committed): review scope/findings, modified files, run commands + real results, new run folder path, recommended TRAE screenshots, Session ID recording reminder, suggested commit message, unfinished items and risks.

## Suggested commit message

`refactor(api): use deterministic community plan matcher`

(Per the S08 handoff prompt. The refactor itself was already committed in earlier commits `ac747f1e` / `960246fb`; this change adds the logging regression guard, R13 supervisor evidence, and the captured S08 TRAE evidence.)
