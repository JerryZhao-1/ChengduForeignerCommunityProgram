# Plan: Validate AI-free Competition Release Candidate (R17 consolidated re-gate)

> Review correction (2026-07-15): this original TRAE plan produced run-0034, which is preserved unchanged but superseded. Run-0035 corrected the CLI scope and fail-closed scan; run-0036 exposed the missing post-plan locale switch. The product correction and Computer Use GUI PASS are in run-0037, and the authoritative post-fix CLI PASS is run-0038.

## Summary

Take over the `competition/trae-h5-demo` branch and re-run the complete local release gate for the AI-free "桐邻 First 120 Minutes" product. Produce a single new immutable validation run folder (`run-0034`) that captures real CLI outputs/logs for all 9 gate commands, verifies every coverage/safety metric, and prepares (but does not execute) the GUI MCP runbook. The Worker does not declare PASS/FAIL; the Supervisor writes the final verdict after executing the GUI portion.

No production code changes. No new features. The implementation is already AI-free and deterministic — this is a re-validation pass against current HEAD `97ad1e40`.

## Current State Analysis

### Branch & working tree
- Branch: `competition/trae-h5-demo` (clean, up to date with origin)
- HEAD: `97ad1e40` ("Clarify R16 evidence rules and reopen task 16.1")

### Task status (from `openspec/changes/launch-trae-competition-h5-demo/tasks.md`)
- R10–R15, R17: checked `[x]` DONE with authoritative PASS evidence
- R16 (16.1): unchecked `[ ]`, PARTIAL evidence in `run-0033` (CLI PASS, GUI PENDING — MCP runbook prepared but not executed)
- R18 (18.1): unchecked `[ ]`, independent deployment — explicitly out of scope for this session

### Implementation ground truth (confirmed by Phase 1 exploration)
- **Shared layer** (`packages/shared/src/`):
  - `schemas/community-plans.ts` — strict 5-field request schema, safe place/event projection schemas, `CommunityPlanSchema` with `superRefine` (1 place_visit + 1 event_attend, durations sum to 120), `catalog_version = "tongzilin-curated-v1"`.
  - `community-plan/engine.ts` — deterministic matcher `generateCommunityPlan`; `enumerateCommunityPlanScenarios` → 576; `enumerateCommunityPlanLocalizedCases` → 1,152; deterministic `derivePlanId`.
  - `community-plan/narration.ts` — exactly 21 bilingual dimension modules (8+3+4+6); no 576 duplicated full texts.
  - `mock/community-plan-offline-bundle.ts` — safe bundle validated by `CommunityPlanCatalogBundleSchema`.
  - Tests: `community-plans.spec.ts` (328 lines), `community-plan-engine.spec.ts` (292 lines) — assert 21/21, 576/576, 1,152/1,152, 0 mismatches, safe-bundle field rejection, `deliveryMode` rejected by plan schema.
- **API layer** (`apps/api/src/`):
  - `routes/community-plan.ts` — single `POST /community-plan/generate`, guest-only, rate-limited (10/min), logs only `requestId/actor_kind/community_id/scenario_key/catalog_version/duration_ms/timestamp`.
  - `providers/mock/index.ts`, `providers/cloudbase/index.ts`, `providers/cloudbase/deploy-fallback.ts` — all call the same shared matcher; no LLM/model adapter anywhere.
  - `lib/community-plan-rate-limit.ts` — 10/min, 429 `RATE_LIMITED`, sets rate-limit headers.
  - Tests: `community-plan.spec.ts` (346 lines) — 576 provider profiles, guest 200, 401/403/429/400, privacy-safe log.
- **Mobile layer** (`apps/mobile/src/`):
  - `api/community-plan-adapter.ts` — online (200) → `success`/`online`; 5xx/transport → `fallback`/`offline`; 4xx (400/403/404/409/429) → `api_error`/`online` (no fallback); `deliveryMode` stays in state, never in plan.
  - `api/client.ts` — `createMobileGuestClient` sends `x-guest-mode: judge`, no mock-user/auth headers.
  - Tests: `community-plan-adapter.spec.ts` (283 lines) — 576-preference parity, 4xx no-fallback, 5xx/transport fallback, boundary (same fingerprint, different deliveryMode).
- **Build config** (`apps/mobile/vite.config.ts`) — clean, no keys/mode/define.

### Existing run folders
- 33 immutable run folders (`run-0001` → `run-0033`) under `auto_test_openspec/launch-trae-competition-h5-demo/`.
- Most recent R17 PASS: `run-0018` (2026-07-15T084100Z).
- Most recent R16: `run-0033` (CLI PASS, GUI PENDING).
- **Next available run number: `0034`.**

## Proposed Changes

### 1. Create new immutable run folder `run-0034`

**Path:** `auto_test_openspec/launch-trae-competition-h5-demo/run-0034__task-17.1__ref-R17__<UTC_TIMESTAMP>Z/`

**Scope:** MIXED (R17 CLI release gate as primary; GUI checks referenced from R16 run-0033 runbook). Documented in `task.md` that R17's task definition is SCOPE: CLI, and the GUI portion is included per the user's comprehensive re-validation request, with GUI execution reserved for the Supervisor.

**Why:** The user explicitly requested "执行完整本地发布门禁" (R17) plus additional checks including GUI verification, all captured in a brand-new immutable run folder with real outputs/logs/screenshot index. One consolidated folder matches the established convention (run-0018 pattern) and the user's "为每项创建全新的不可变 run folder" instruction.

**Contents to create (Worker-produced, no PASS/FAIL verdict):**

| File | Purpose |
|------|---------|
| `task.md` | Self-sufficient run readme: change-id, run#, task-id, ref-id, SCOPE, HEAD commit, how-to-run (macOS/Linux + Windows), inputs/outputs/expected, acceptance criteria, boundary statement, provenance. |
| `run.sh` | macOS/Linux entry: cd to bundle dir, run all 9 gate commands + coverage/focus tests + forbidden-marker scan + artifact existence checks + write-checks, tee to `logs/run.log`. |
| `run.bat` | Windows equivalent of `run.sh`. |
| `tests/write-checks.mjs` | Node script that writes `outputs/checks.json` with the verified counts (21/21, 576/576, 576 unique, 1152/1152, 576/576 parity, 0 mismatches, 0 model markers, `finalDecision: "pending_supervisor"`). |
| `tests/gui_runbook_release_gate.md` | MCP-only GUI runbook covering: console errors, horizontal scroll at 390px, raw enum leakage, AI-generated text absence, zh/en switch, route-map two-stop render, completion state. References run-0033's runbook for the 4-profile matrix. |
| `expected/checks.json` | Expected machine-decidable result for `cmp` comparison. |
| `logs/` | Created at run time; will hold `run.log`, `preflight.log`, `gui-screenshot-index.md` (placeholder until supervisor executes GUI), `supervisor-verdict.md` (placeholder). |
| `outputs/` | Created at run time; will hold `checks.json` and any screenshots (pending supervisor GUI execution). |

### 2. Execute the 9 gate commands and capture real outputs (Worker step)

Run sequentially in the order specified by the user, all teed into `logs/run.log`:

1. `openspec validate launch-trae-competition-h5-demo --strict --no-interactive`
2. `pnpm --filter @community-map/shared typecheck`
3. `pnpm --filter @community-map/api typecheck`
4. `pnpm --filter @community-map/mobile typecheck`
5. `pnpm typecheck`
6. `pnpm test`
7. `pnpm lint`
8. `pnpm --filter @community-map/mobile build:h5`
9. `pnpm --filter @community-map/mobile build:mp-weixin`

### 3. Execute additional verification checks (Worker step, CLI-based)

After the 9 commands, run inside `run.sh`:

- **Coverage focus tests:** `vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts` — assert 21/21 modules, 576/576 scenarios, 576 unique keys, 1,152/1,152 localized cases, 576/576 provider/local parity, 0 reason/module mismatches.
- **Build artifact existence:** `test -f apps/mobile/dist/build/h5/index.html` and `test -f apps/mobile/dist/build/mp-weixin/app.json`.
- **Forbidden model-runtime marker scan:** `rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob '!**/*.map'` — must return no matches (exit 1 from rg means clean).
- **Type escape scan:** `rg -n "\bas any\b|@ts-ignore|@ts-nocheck" apps/api/src apps/mobile/src packages/shared/src --glob '!**/*.spec.ts'` — must return no matches.
- **Write checks:** `node tests/write-checks.mjs outputs/checks.json` then `cmp outputs/checks.json expected/checks.json`.

### 4. Prepare GUI runbook (Worker step, no execution)

Create `tests/gui_runbook_release_gate.md` referencing run-0033's `tests/gui_runbook_judge_journey.md` for the 4-profile × 2-locale matrix. Add explicit assertion points for the user's GUI checks:
- No browser console errors during welcome → complete flow.
- No horizontal scroll at 390px viewport.
- No raw enum strings in rendered UI (all copy from central catalog).
- No AI-generated text (no "generated by AI", "model status", "powered by LLM", etc.).
- zh/en switch preserves session, scenario_key unchanged.

Create `logs/gui-screenshot-index.md` as a placeholder listing the required screenshots to be captured by the Supervisor.

### 5. Write placeholder supervisor verdict (Worker step)

Create `logs/supervisor-verdict.md` with:
- CLI verdict: `PENDING_SUPERVISOR` (Worker ran the commands but does not declare PASS)
- GUI verdict: `PENDING_SUPERVISOR` (runbook prepared, awaiting MCP browser execution)
- Overall: `PENDING_SUPERVISOR`
- TRAE Session ID: `<copy-from-TRAE-UI>` placeholder (not fabricated)

### 6. Do NOT modify production code

No changes to `apps/`, `packages/`, `openspec/`, or `docs/` source. Only create files under `auto_test_openspec/launch-trae-competition-h5-demo/run-0034__*/`.

### 7. Do NOT modify prior run folders

All 33 existing run folders (run-0001 → run-0033) remain immutable. run-0034 is append-only.

### 8. Do NOT check off R16 or R18 in tasks.md

R16 remains `[ ]` (GUI pending supervisor execution). R18 remains `[ ]` (deployment out of scope). Only the Supervisor can write the final verdict and check off tasks.

## Assumptions & Decisions

1. **One consolidated run folder** (`run-0034`) for R17 with MIXED scope, rather than separate R17 CLI + R16 GUI folders. Rationale: the user's primary ask is "执行完整本地发布门禁" (R17), and the GUI checks are "另外检查" (additional checks) within the same comprehensive validation. This matches the run-0018 consolidated pattern. The scope extension is documented in `task.md`.

2. **Worker runs CLI commands and captures real outputs**, but does NOT write PASS/FAIL. Per the user's explicit constraint "Worker 不得自行宣告 PASS；由 Supervisor 执行后写最终 verdict" and the OpenSpec project convention. The `supervisor-verdict.md` is a placeholder.

3. **GUI MCP runbook is prepared but not executed** by the Worker. The current toolset does not include an MCP browser tool, and per project constraints no Playwright/Selenium scripts may be added. GUI execution is reserved for a Supervisor with MCP browser access. This matches run-0033's established pattern.

4. **No TRAE Session ID is fabricated.** The `logs/supervisor-verdict.md` contains a `<copy-from-TRAE-UI>` placeholder. If this session is run inside TRAE, the user can copy the real Session ID from the TRAE UI; otherwise it remains a placeholder.

5. **No production code changes.** The implementation is already AI-free and deterministic. This is a re-validation pass only. If any check fails, the Worker reports the failure but does not fix code (fixes would require a separate plan).

6. **R18 (independent deployment) is out of scope.** The user explicitly said "完成本 Session 后停止，不进入下一阶段". R18 remains unchecked.

7. **Suggested commit message:** `test: validate AI-free competition release candidate` (as specified by the user). The commit will only contain the new `run-0034` folder contents.

8. **Timestamp:** Use the actual UTC timestamp at folder creation time, in `YYYYMMDDThhmmssZ` format.

## Verification Steps

### Worker verification (executed during this session)
1. `run-0034` folder exists with all required files (`task.md`, `run.sh`, `run.bat`, `tests/write-checks.mjs`, `tests/gui_runbook_release_gate.md`, `expected/checks.json`).
2. `bash run-0034/run.sh` exits 0 (all 9 gate commands + focus tests + artifact checks + forbidden-marker scan + type escape scan + write-checks + cmp all pass).
3. `logs/run.log` contains real command output with exit codes.
4. `outputs/checks.json` matches `expected/checks.json` exactly.
5. `logs/supervisor-verdict.md` exists with `PENDING_SUPERVISOR` (no PASS/FAIL declared by Worker).
6. `logs/gui-screenshot-index.md` exists as a placeholder.
7. No prior run folders (run-0001 → run-0033) were modified.
8. No production code files were modified.

### Supervisor verification (deferred, not executed in this session)
1. Execute `tests/gui_runbook_release_gate.md` via MCP browser against mock-mode H5.
2. Capture screenshots into `outputs/` and update `logs/gui-screenshot-index.md`.
3. Verify: no console errors, no horizontal scroll at 390px, no raw enum leakage, no AI-generated text.
4. Write final PASS/FAIL in `logs/supervisor-verdict.md` with evidence pointers.
5. Copy real TRAE Session ID from TRAE UI into the verdict.

### 8-section output (delivered as final response after execution)
1. 复核范围和发现 (Review scope and findings)
2. 修改文件 (Modified files — only run-0034 contents)
3. 运行命令及真实结果 (Run commands and real results)
4. 新建 validation run folder (New validation run folder — run-0034)
5. 推荐保存的 TRAE 原始截图和产品截图 (Recommended TRAE screenshots and product screenshots)
6. 当前完整 Session ID 的记录提醒 (Current Session ID recording reminder)
7. 建议 commit message (Suggested commit message)
8. 未完成项和风险 (Unfinished items and risks)
