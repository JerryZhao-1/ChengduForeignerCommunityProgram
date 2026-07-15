# Supervisor verdict

- Decision: **PASS**
- Run: `0028`
- Stage: R15 Community Plan adapter, mock mode, and offline bundle parity review
- Branch: `competition/trae-h5-demo`
- HEAD: `e15efde4` (`e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`)
- Evidence: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`, `outputs/parity-summary.json`
- Working-tree note: the supplemented adapter parity/error-branch tests in `apps/mobile/src/api/community-plan-adapter.spec.ts` are uncommitted at validation time.

## Verified

- `pnpm --filter @community-map/mobile typecheck` exited `0`.
- `eslint apps/mobile/src/api/community-plan-adapter.spec.ts` exited `0` with no issues.
- Focused mobile + shared suite passed `36/36` tests across `10` suites (zero failures, zero failed suites).
- Exhaustive provider/local parity holds across all `576/576` logical scenarios (`8 × 3 × 4 × 6`), asserted by `keeps API and local semantic fingerprints equal for all 576 preferences` in `apps/mobile/src/api/community-plan-adapter.spec.ts`. `mismatchedFingerprints: 0`.
- Semantic fingerprint excludes `plan_id`, `generated_at`, and `requestId`; the boundary test additionally documents that online vs offline share fingerprint but differ in `deliveryMode` (`online` vs `offline`).
- Online success returns the API result with `deliveryMode: "online"`; `requestId` is propagated.
- Mock mode, transport errors (`TypeError("Failed to fetch")`, `Error("getaddrinfo ENOTFOUND ...")`, `Error("timeout of 10000ms exceeded")`), and 5xx all fall back to the shared local matcher `generateLocalCommunityPlan` with `deliveryMode: "offline"` and `errorKey: null`.
- 400, 403, 404, 409, 429 stay as localized `api_error` (`status: "api_error"`, `errorKey` set, `plan: null`); they do **not** switch to offline.
- `deliveryMode` lives only in mobile adapter/store state; it is **not** a field of `CommunityPlanSchema` (locked by R11 run-0027).
- Offline route completion holds: `onboarding-store.spec.ts` covers `setPlan(plan, "offline")` + place visit + Demo Confirm + finish.
- The offline bundle (`packages/shared/src/mock/community-plan-offline-bundle.ts`) carries only catalog data; no production keys, CloudBase private config, server-side map keys, or production backend addresses are bundled (`bundleHasNoProductionSecrets: true` by inspection).

## Boundary

This run validates R15 only (mobile adapter / mock mode / offline bundle parity, CLI scope). It does not provide:
- R11 shared singular contract lock (run-0027 is the companion PASS).
- R12 curated catalog/matcher exhaustive coverage (run-0023 is the existing PASS).
- R13 API/provider/security gate (run-0025 is the existing PASS).
- GUI acceptance (use the MCP runbook in R14/R16 for that).
- R18 independent public deployment or external online/offline acceptance.
- TRAE Session evidence. The TRAE Session ID must be copied by the user from the TRAE UI into `docs/competition/trae-evidence-log.md`; this CLI run does not independently authenticate that UI evidence.
