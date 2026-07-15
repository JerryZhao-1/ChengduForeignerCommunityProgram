# Community Plan singular contract lock review (R11)

- Change: `launch-trae-competition-h5-demo`
- Run: `0027`
- Task: `11.1`
- Ref: `R11`
- Scope: `CLI`
- HEAD short: `e15efde4` (last commit at validation time; this run's working-tree changes are the supplemented contract tests in `packages/shared/test/community-plans.spec.ts`, uncommitted)
- Branch: `competition/trae-h5-demo`
- Provenance: CLI-only review of `packages/shared` Community Plan schemas, types, contracts, paths, and clients to confirm the strict singular preference surface and explainable response contract. Companion re-review of R11 after the S07B session; does not duplicate R12 (catalog/matcher) or R17 (consolidated gate).

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0027__task-11.1__ref-R11__20260715T121731Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0027__task-11.1__ref-R11__20260715T121731Z\run.bat`
- Both scripts resolve the repository from their own directory and invoke `tests/verify-vitest.mjs`. The Windows script was inspected for parity but not executed on this macOS validation host.

## Inputs, outputs, and expected result

- Input: the current worktree (with the supplemented `packages/shared/test/community-plans.spec.ts`), the active OpenSpec change, and the shared schemas/contracts/paths/client.
- Output: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`.
- Expected:
  - `pnpm --filter @community-map/shared typecheck` exits `0`.
  - `eslint packages/shared/test/community-plans.spec.ts` exits `0`.
  - `vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/community-plan-engine.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits `0` with all tests passing.
  - `outputs/result.json` records the final decision (`pass`), exit codes, and the unchecked R18 boundary.

## Acceptance criteria (R11)

- `NewResidentPreferenceSchema` is `.strict()` and accepts exactly the five required singular fields (`preferred_language`, `primary_interest`, `arrival_context`, `household_type`, `accessibility_need`); `primary_interest` uses one of eight enums and `accessibility_need` is `none` or one of five needs.
- The request rejects legacy arrays, unknown keys, `community_id`, identity/contact (PII) fields, free text, and array values on the singular fields.
- Removing any one of the five required fields is rejected.
- `CommunityPlanSchema` requires `scenario_key`, literal `catalog_version` (`tongzilin-curated-v1`), and `selection_explanation` with bilingual summary plus exactly four ordered reasons (`primary_interest`, `arrival_context`, `household_type`, `accessibility_need`).
- The response contains no `generation_source`, `ai_status`, `usage`, `generated_by`, `model`, or `prompt` field.
- Only `POST /community-plan/generate` is exposed; `apiPaths.communityPlan` has only `generate`, the contract is POST + strict request + strict response, and the mock client `communityPlan` surface exposes only `generate`.
- Place and event projections are `.strict()` and cannot carry detail/admin/capacity/contact/moderation fields.

## Boundary

This run validates R11 only (shared singular contracts). It does not provide:
- R12 curated catalog/matcher exhaustive coverage (separate run, run-0023 is the existing PASS).
- R13 API/provider/security gate (separate run, run-0025 is the existing PASS).
- R15 provider/local parity gate (separate run, run-0028 is the companion PASS).
- GUI acceptance (use the MCP runbook in R14/R16 for that).
- R18 independent public deployment or external online/offline acceptance.
- TRAE Session evidence. The TRAE Session ID must be copied by the user from the TRAE UI into `docs/competition/trae-evidence-log.md`; this CLI run does not independently authenticate that UI evidence.
