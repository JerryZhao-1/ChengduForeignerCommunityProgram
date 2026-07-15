# Plan: 复核 Community Plan 契约锁定与在线/离线 Parity（R11 + R15）

## Summary

接管 `competition/trae-h5-demo` 分支上的“桐邻 First 120 Minutes｜社区策展融入路线”。本 Session 只做两件事：

1. **R11 — 复核并锁定 Community Plan shared schemas/types/contracts/paths/clients**，补充少量有效/无效 contract 测试，运行 shared typecheck + focused tests。建议 commit：`refactor(shared): lock deterministic community plan contracts`
2. **R15 — 复核 Community Plan adapter、mock mode、离线 bundle，穷举验证 provider/local parity 576/576 并覆盖所有错误分支**，补充少量 parity/错误分支测试，运行 mobile typecheck + adapter/store tests + shared parity tests。建议 commit：`test(mobile): prove online and offline plan parity`

完成后输出 8 点报告，**不进入下一阶段（R16+）**。不修改历史 R1–R9 证据，不虚构 TRAE Session ID/截图/公开 URL。

## Current State Analysis（Phase 1 探索结论）

### 现有实现已经满足的要求（无需改生产代码）

**Shared 契约层（[packages/shared/src/schemas/community-plans.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/schemas/community-plans.ts)）**
- `NewResidentPreferenceSchema.strict()` 只接受 5 个必选字段：`preferred_language`、`primary_interest`(8 枚举)、`arrival_context`(3)、`household_type`(4)、`accessibility_need`(none+5)。✓
- 拒绝 arrays、`community_id`、PII、自由文本、未知字段（strict + 测试覆盖）。✓
- `CommunityPlanSchema` 要求 `scenario_key`、`catalog_version`(literal `tongzilin-curated-v1`)、`selection_explanation`(summary + 4 个有序 reason tuple)，`.strict()` 拒绝 `generation_source`/`ai_status`/`usage`/`generated_by`/`model`/`prompt`。✓
- 两项路线 invariant（一 place_visit + 一 event_attend，offset 0/60，总 120 分钟，ref_id 一致，无重叠）由 `superRefine` 强制。✓
- `CommunityPlanPlaceProjectionSchema`/`CommunityPlanEventProjectionSchema` 均 `.strict()`，不含 address/gallery/navigation/contact/capacity/moderation 字段。✓

**Paths / Contract / Client（[paths.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/contracts/paths.ts)、[community-plans.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/contracts/community-plans.ts)、[client.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/client.ts)）**
- `apiPaths.communityPlan` 只有 `generate: "/community-plan/generate"`。✓
- `communityPlanContracts.generate` = POST + strict request + strict response。✓
- `CommunityMapApiClient.communityPlan` 接口只有 `generate(input)`。✓
- mock client 与 HTTP client 均只暴露 `generate`。✓

**Mobile adapter / mock / offline bundle（[community-plan-adapter.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/community-plan-adapter.ts)、[client.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/client.ts)、[community-plan-offline-bundle.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/mock/community-plan-offline-bundle.ts)）**
- online 成功 → `status:"success"` + `deliveryMode:"online"` + API 结果。✓
- mock mode、transport/DNS/timeout/5xx → 调用 shared matcher `generateLocalCommunityPlan` → `deliveryMode:"offline"`。✓
- 400/403/404/409/429 → `status:"api_error"` + 本地化 errorKey，**不切离线**。✓（adapter 用 `error.status < 500` 分流）
- `DeliveryMode` 是 adapter/store state，**不在** `CommunityPlanSchema`。✓
- 离线 bundle 只含 catalog 数据，无生产密钥/服务端配置。✓
- API provider（mock）与 local 都调用同一 `createCompetitionDemoEngineInput` + `generateCommunityPlan`。✓

**Parity / 错误分支测试现状**
- [community-plan-adapter.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/community-plan-adapter.spec.ts) 已有 576/576 parity（fingerprint = scenario_key + catalog_version + selection_explanation + items 的 ref_id/ref_type/summary/tips，**排除** plan_id/generated_at/requestId），并覆盖 400/403/404/409/429/5xx/transport/mock-mode。✓
- [onboarding-store.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/stores/onboarding-store.spec.ts) 已测 `setPlan(plan,"offline")` + visit + demo confirm + finish。✓
- [community-plan-engine.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) 已穷举 576 scenarios / 576 unique keys / 1,152 localized cases / 21 modules / 0 invalid / 0 missing copy / 0 reason-module mismatch。✓
- [apps/api/test/community-plan.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/api/test/community-plan.spec.ts) 已测 provider 576 生成、guest 安全、limiter、隐私日志、legacy 字段 400。✓

### 发现的测试覆盖缺口（仅补测试，不改生产代码）

1. shared contract “rejects missing required fields” 只测了移除 `accessibility_need`，未逐字段验证 5 个必选字段各自缺失被拒。
2. shared contract 未显式测试**单选字段拒绝数组值**（`primary_interest: [...]`、`accessibility_need: [...]`）；现有 legacy 测试只覆盖复数 `interests`/`accessibility_needs`。
3. shared 未运行时验证 mock client 的 `communityPlan` surface 只暴露 `generate`（仅 paths/contract 做了 key 检查）。
4. mobile adapter parity 测试已隐式排除 `plan_id`/`generated_at`/`requestId`，但未显式断言“online 与 offline 的 deliveryMode 不同、语义 fingerprint 相同”这一边界（单偏好聚焦断言更清晰）。
5. mobile adapter 未显式覆盖 **DNS/timeout 风格** 的 transport 错误（现有只有 `TypeError("Failed to fetch")`，属同一分支但用户明确点名 DNS/timeout）。

### 不做的事（边界）

- 不改任何生产代码（schemas/engine/adapter/store/provider/route 均已满足要求）。
- 不重构无关 `as any`（`client.ts:136`、`mock/service.ts:852-853` 不在 Community Plan 路径，属既有代码，按 AGENTS.md 最小改动原则不动）。
- 不修改历史 run folder（run-0001..run-0026）、不修改 R1–R9 证据、不修改历史截图。
- 不虚构 TRAE Session ID / 截图 / 公开 URL / 部署状态。
- 不做 GUI 验证（R11/R15 均为 CLI scope）；GUI/MIXED 留给 R14/R16/R18。
- 不进入 R16+ 阶段。

## Proposed Changes

### Change 1 — 补充 shared contract 测试（R11）

**文件**：[packages/shared/test/community-plans.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plans.spec.ts)

在 `describe("community plan singular preference")` 内补充：
- 扩展 “rejects missing required fields”：遍历 5 个必选字段，逐一删除并断言 `safeParse(...).success === false`。
- 新增 “rejects array values on singular fields”：`primary_interest: ["community-service"]`、`accessibility_need: ["none"]`、`arrival_context: ["first-week"]`、`household_type: ["solo"]` 各自被拒。

在 `describe("community plan contract surface")` 内补充：
- 新增 “exposes only generate on the mock client communityPlan surface”：`expect(Object.keys(createMockClient({}).communityPlan)).toEqual(["generate"])`（从 `@community-map/shared` import `createMockClient`）。

### Change 2 — 补充 mobile adapter parity/error-branch 测试（R15）

**文件**：[apps/mobile/src/api/community-plan-adapter.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/community-plan-adapter.spec.ts)

补充：
- 新增 “online and offline share semantic fingerprint but differ in delivery mode”（单偏好聚焦）：对 `validPreference`，mock online 返回 API plan、mock offline 抛 transport 错误；断言 `online.deliveryMode==="online"`、`offline.deliveryMode==="offline"`、两者 fingerprint 相等，并显式断言 `online.plan.plan_id === offline.plan.plan_id`（同 matcher 必然相等，用于文档化边界）。
- 新增 “falls back on DNS and timeout style transport errors”：用 `new Error("getaddrinfo ENOTFOUND")` 与 `new Error("timeout of 10000ms exceeded")` 两个非 `ApiClientError` 各自触发 fallback，断言 `status==="fallback"`、`deliveryMode==="offline"`、`plan` 非空。

### Change 3 — 新建 R11 validation run folder（不可变证据）

**目录**：`auto_test_openspec/launch-trae-competition-h5-demo/run-0027__task-11.1__ref-R11__<YYYYMMDDThhmmssZ>/`

内容（参照 run-0022/run-0023 结构）：
- `task.md`：change-id、run#0027、task 11.1、ref R11、SCOPE: CLI、运行说明（macOS/Linux + Windows）、输入/输出/期望、pass/fail 规则。
- `run.sh` / `run.bat`：cd 自身目录 → 运行 `pnpm --filter @community-map/shared typecheck` 与 focused vitest（`community-plans.spec.ts`、`community-plan-engine.spec.ts`、`contracts.spec.ts`、`client.spec.ts`），写 logs/ 与 outputs/result.json，失败时非零退出。
- `tests/verify-vitest.mjs`：执行 vitest 并汇总 PASS/FAIL 计数到 outputs/result.json。
- `expected/result.json`：期望 typecheck exit 0、focused tests 全 PASS。
- `logs/run.log`：真实命令输出。
- `outputs/result.json`：真实结果。
- `supervisor-verdict.md`：PASS/FAIL + 证据指针 + 命令 + exit code。

### Change 4 — 新建 R15 validation run folder（不可变证据）

**目录**：`auto_test_openspec/launch-trae-competition-h5-demo/run-0028__task-15.1__ref-R15__<YYYYMMDDThhmmssZ>/`

内容：
- `task.md`：run#0028、task 15.1、ref R15、SCOPE: CLI、覆盖 576/576 parity + 全错误分支 + offline 完成路线。
- `run.sh` / `run.bat`：运行 `pnpm --filter @community-map/mobile typecheck`、mobile adapter spec、onboarding-store spec，以及 shared `community-plan-engine.spec.ts`（parity 源）；汇总到 outputs/parity-summary.json + outputs/result.json。
- `tests/verify-vitest.mjs`：执行 vitest 并校验 parity 计数（576/576）写入 outputs。
- `expected/parity-summary.json`：`{ providerLocalParity: 576, totalScenarios: 576, mismatchedFingerprints: 0 }`。
- `expected/result.json`：typecheck exit 0、tests 全 PASS。
- `logs/run.log`、`outputs/parity-summary.json`、`outputs/result.json`、`supervisor-verdict.md`。

## Assumptions & Decisions

- **Assumption**：现有生产代码（schemas/engine/adapter/store/provider/route/offline-bundle）已满足全部列出要求，故本 Session 只补测试 + 造证据，不改生产代码。若执行时 typecheck/test 发现真实 bug，会停下来报告而非擅自重构。
- **Decision**：两个独立 commit 对应两个独立 run folder（run-0027=R11，run-0028=R15），与 tasks.md 的 R11/R15 ref 对齐。
- **Decision**：run folder 编号续接当前最高 run-0026 → 0027/0028。
- **Decision**：不提交 git commit（AGENTS.md 安全协议：未经明确请求不 commit）。只在报告中给出建议 commit message；是否提交由用户决定。
- **Decision**：TRAE Session ID 由用户从 TRAE UI 复制填入 `trae-evidence-log.md`，本 Session 不虚构。
- **Decision**：R11/R15 为 CLI scope，不产生 GUI 截图；报告中“推荐截图”项标注 N/A 并说明原因。

## Verification Steps

1. `pnpm --filter @community-map/shared typecheck` → exit 0
2. `pnpm --filter @community-map/mobile typecheck` → exit 0
3. `./node_modules/.bin/vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/community-plan-engine.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` → 全 PASS（含新增断言）
4. `./node_modules/.bin/vitest run apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts` → 全 PASS（含新增 DNS/timeout + parity 边界断言）
5. 执行 `run-0027/run.sh` 与 `run-0028/run.sh`，确认 logs/outputs 真实生成且 supervisor-verdict 写入 PASS
6. `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` → exit 0（确认 tasks.md 格式未被破坏）
7. 确认未修改 run-0001..run-0026 及任何历史截图/R1–R9 证据

## 完成后输出（8 点报告）

1. 复核范围和发现
2. 修改文件（仅 2 个测试文件 + 2 个新 run folder）
3. 运行命令及真实结果
4. 新建 validation run folder（run-0027、run-0028）
5. 推荐保存的 TRAE 原始截图和产品截图（CLI scope → N/A，说明原因）
6. 当前完整 Session ID 的记录提醒（用户需从 TRAE UI 复制）
7. 建议 commit message（两条）
8. 未完成项和风险
