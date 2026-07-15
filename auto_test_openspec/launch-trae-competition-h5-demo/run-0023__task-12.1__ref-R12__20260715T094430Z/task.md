# Curated catalog and matcher exhaustive review (R12)

- Change: `launch-trae-competition-h5-demo`
- Run: `0023`
- Task: `12.1`
- Ref: `R12`
- Scope: `CLI`
- HEAD short: `cafddb2c` (last commit at validation time; this run's working-tree change is the augmented coverage-summary test, uncommitted)
- Branch: `competition/trae-h5-demo`
- Provenance: CLI-only exhaustive review of `packages/shared` curated catalog, matcher, fixtures, and tests for the 21-module / 576-scenario / 1,152-localized-case matrix. Companion to R10 (S07A) and R11 (S07B) CLI gates; does not duplicate R17 consolidated gate.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0023__task-12.1__ref-R12__20260715T094430Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0023__task-12.1__ref-R12__20260715T094430Z\run.bat`
- Both scripts resolve the repository from their own directory and invoke `tests/verify-vitest.mjs`. The Windows script was inspected for parity but not executed on this macOS validation host.

## Inputs, outputs, and expected result

- Input: the current worktree (with the augmented `packages/shared/test/community-plan-engine.spec.ts`), the active OpenSpec change, the versioned `tongzilin-curated-v1` catalog, and the shared matcher/fixtures.
- Output: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`, `outputs/coverage-summary.json`.
- Expected:
  - `pnpm --filter @community-map/shared typecheck` exits `0`.
  - `eslint packages/shared/test/community-plan-engine.spec.ts` exits `0`.
  - `vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts` exits `0` with all tests passing.
  - The augmented `reports the required machine-decidable coverage summary` test independently computes and asserts `bilingualDimensionModules: 21`, `logicalScenarios: 576`, `uniqueScenarioKeys: 576`, `localizedRenderCases: 1152`, `invalidPlans: 0`, `missingCopy: 0`, `reasonModuleMismatches: 0`.
  - `outputs/coverage-summary.json` records those 7 metrics plus a `provenBy` pointer to the asserting test.
  - `outputs/result.json` records the final decision (`pass`), exit codes, and the unchecked R18 boundary.

## Acceptance criteria (R12)

- catalog_version is fixed to `tongzilin-curated-v1`.
- Exactly 21 bilingual dimension modules (8 interests + 3 arrival contexts + 4 household types + 6 accessibility needs), all with non-empty `summary_zh/summary_en/reason_zh/reason_en/tip_zh/tip_en`.
- 576 logical scenarios enumerate to 576 unique stable `scenario_key` values.
- 1,152 localized render cases (576 × zh/en).
- Every plan parses against `CommunityPlanSchema`; zero invalid plans.
- Every reason has non-empty `text_zh` and `text_en`; zero missing copy.
- Every reason text equals the pre-written module for its corresponding preference dimension; zero reason/module mismatches.
- Stable place selection (score desc, `_id` asc tie-break); deterministic across repeated calls; language-independent.
- `accessibility_need` only changes explanation and preparation tips; copy contains "没有认证 / does not certify" disclaimers (no unverified facility claims).
- Missing curated place or curated event throws explicitly; matcher does not invent a route.
- API mock provider, API CloudBase live provider, and mobile H5 local adapter all share the same `communityPlanCatalogBundle` + `generateCommunityPlan` matcher.

## Boundary

This run validates R12 only (curated catalog, matcher, fixtures, exhaustive coverage). It does not provide:
- GUI acceptance (use the MCP runbook in R14/R16 for that).
- R13 API/provider/security gate (separate run).
- R15 provider/local parity gate (separate run).
- R17 consolidated CLI gate (separate run, run-0018 is the existing PASS).
- R18 independent public deployment or external online/offline acceptance.
- TRAE Session evidence. The S07C Session ID was copied by the user from the TRAE UI into `docs/competition/trae-evidence-log.md`; this CLI run does not independently authenticate that UI evidence.
