# Community Plan adapter, mock mode, and offline bundle parity review (R15)

- Change: `launch-trae-competition-h5-demo`
- Run: `0028`
- Task: `15.1`
- Ref: `R15`
- Scope: `CLI`
- HEAD short: `e15efde4` (last commit at validation time; this run's working-tree changes are the supplemented adapter parity/error-branch tests in `apps/mobile/src/api/community-plan-adapter.spec.ts`, uncommitted)
- Branch: `competition/trae-h5-demo`
- Provenance: CLI-only review of the mobile Community Plan adapter, mock mode, and offline bundle to confirm provider/local parity (576/576), full error-branch coverage, offline route completion, and bundle safety. Companion to R11 (S07B singular contracts, run-0027) and R12 (catalog/matcher, run-0023); does not duplicate R13 (API/provider/security, run-0025) or R17 (consolidated gate).

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0028__task-15.1__ref-R15__20260715T122212Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0028__task-15.1__ref-R15__20260715T122212Z\run.bat`
- Both scripts resolve the repository from their own directory and invoke `tests/verify-vitest.mjs`. The Windows script was inspected for parity but not executed on this macOS validation host.

## Inputs, outputs, and expected result

- Input: the current worktree (with the supplemented `apps/mobile/src/api/community-plan-adapter.spec.ts`), the active OpenSpec change, the shared `community-plan-engine` matcher (parity source), the mobile adapter, the onboarding store, and the offline bundle.
- Output: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`, `outputs/parity-summary.json`.
- Expected:
  - `pnpm --filter @community-map/mobile typecheck` exits `0`.
  - `eslint apps/mobile/src/api/community-plan-adapter.spec.ts` exits `0`.
  - `vitest run apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts packages/shared/test/community-plan-engine.spec.ts` exits `0` with all tests passing.
  - `outputs/parity-summary.json` records `providerLocalParity: "576/576"`, `mismatchedFingerprints: 0`, `deliveryModeInsidePlan: false`, `fourXStaysApiError: true`, `transportAndFiveXFallback: true`.
  - `outputs/result.json` records the final decision (`pass`), exit codes, and the unchecked R18 boundary.

## Acceptance criteria (R15)

- Online success returns the API result with `deliveryMode: "online"`.
- Mock mode, transport errors (DNS, timeout, fetch failure), and 5xx all fall back to the shared local matcher (`generateLocalCommunityPlan`) with `deliveryMode: "offline"`.
- 400, 403, 404, 409, 429 stay as localized `api_error` (`errorKey` set, `plan: null`); they do **not** switch to offline.
- `deliveryMode` lives only in mobile adapter/store state; it is **not** a field of `CommunityPlanSchema`.
- For the same preference, online and offline produce identical semantic fingerprints (`scenario_key`, `catalog_version`, `selection_explanation`, items' `ref_id`/`ref_type`/`summary`/`tips`). `plan_id`, `generated_at`, and `requestId` may be equal (same deterministic matcher) but are excluded from the semantic fingerprint contract.
- Exhaustive provider/local parity holds across all 576 logical scenarios (8 × 3 × 4 × 6).
- After offline fallback the user can still visit the place, perform Demo Confirm, and finish the route (covered by `onboarding-store.spec.ts`).
- The offline bundle carries only catalog data; no production keys, CloudBase private config, server-side map keys, or production backend addresses are bundled.
- Error branches covered: 400, 403, 404, 409, 429, 500/502/503/504 (5xx), `TypeError("Failed to fetch")`, `Error("getaddrinfo ENOTFOUND ...")`, `Error("timeout of 10000ms exceeded")`, mock-mode (no HTTP configured).

## Boundary

This run validates R15 only (mobile adapter / mock mode / offline bundle parity, CLI scope). It does not provide:
- R11 shared singular contract lock (run-0027 is the companion PASS).
- R12 curated catalog/matcher exhaustive coverage (run-0023 is the existing PASS).
- R13 API/provider/security gate (run-0025 is the existing PASS).
- GUI acceptance (use the MCP runbook in R14/R16 for that).
- R18 independent public deployment or external online/offline acceptance.
- TRAE Session evidence. The TRAE Session ID must be copied by the user from the TRAE UI into `docs/competition/trae-evidence-log.md`; this CLI run does not independently authenticate that UI evidence.
