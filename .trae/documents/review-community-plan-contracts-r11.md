# Plan: 复核并锁定 Community Plan 确定性契约 (R11)

## Summary

接管 `competition/trae-h5-demo` 分支上的 R11（Shared singular contracts）复核任务。当前实现已经通过 28 个测试且 shared typecheck 绿。本 Session 只做必要补强：针对用户明确点名的 `model`/`prompt` 响应字段、更全面的投影泄露字段、更多 PII 字段补充少量无效契约测试，运行 shared typecheck 与 focused tests，新建 R11 validation run folder，并输出八项交付物。不做无关重构，不进入下一阶段。

## Current State Analysis (Phase 1 findings)

### 已确认的契约事实

复核 `packages/shared/src/schemas/community-plans.ts`、`contracts/community-plans.ts`、`contracts/paths.ts`、`client.ts`、`community-plan/engine.ts`、`community-plan/narration.ts`、`mock/client.ts`、`mock/community-plan-offline-bundle.ts`、`mock/competition-fixtures.ts`、`types/entities.ts` 后确认：

1. **请求只接受五个严格字段** — `NewResidentPreferenceSchema` 使用 `.strict()`，仅接受 `preferred_language`、`primary_interest`、`arrival_context`、`household_type`、`accessibility_need`。✅
2. **兴趣和参与需求均为必选单选** — `primary_interest: CommunityPlanInterestSchema`（z.enum 8 值，必填，非数组）；`accessibility_need: CommunityPlanAccessibilityNeedSchema`（z.enum 6 值，必填，非数组）。✅
3. **拒绝旧 arrays、community_id、PII、自由文本和未知字段** — `.strict()` 拒绝未知键；现有测试覆盖 `interests`/`accessibility_needs` 数组、`community_id`、`phone`、`notes`。✅（PII 覆盖可加强）
4. **响应要求 scenario_key、catalog_version、四条有序理由和严格两站路线** — `CommunityPlanSchema` 含 `scenario_key`（regex）、`catalog_version`（literal `tongzilin-curated-v1`）、`selection_explanation.reasons` 为 `z.tuple` 固定 4 项有序（primary_interest → arrival_context → household_type → accessibility_need）、`items` 长度 2、`total_duration_minutes: z.literal(120)`、`route_kind`。✅
5. **响应中不存在 generated_by、ai_status、usage、model 或 prompt 字段** — `.strict()` 拒绝未知键；现有测试覆盖 `generation_source`/`ai_status`/`usage`/`generated_by`，但**未显式测试 `model` 和 `prompt`**。⚠️ 小缺口
6. **只暴露 POST /community-plan/generate** — `apiPaths.communityPlan` 仅 `generate`；`communityPlanContracts` 仅 `generate`（method POST）；`CommunityMapApiClient.communityPlan` 仅 `generate`；`apps/api/src/routes/community-plan.ts` 仅注册 `POST /community-plan/generate`。✅
7. **地点和活动投影不泄露详情、管理、容量、联系方式和审核字段** — `CommunityPlanPlaceProjectionSchema` 与 `CommunityPlanEventProjectionSchema` 均 `.strict()`；现有测试仅覆盖 place `address_zh` 和 event `capacity`，**未覆盖 admin/review/contact/registration/detail 字段**。⚠️ 小缺口

### 当前测试状态

- `packages/shared/test/community-plans.spec.ts`：14 tests pass
- `packages/shared/test/community-plan-engine.spec.ts`：14 tests pass
- `pnpm --filter @community-map/shared typecheck`：exit 0
- `packages/shared/test/client.spec.ts`：含 4 个 communityPlan client 测试（mock 确定性、mock 幂等、http POST 路径、http 不发 mock actor header）

### Git 状态

- Branch: `competition/trae-h5-demo`
- HEAD: `dab330b`
- Working tree clean
- R10–R17 在 tasks.md 中已标记 `[x]`；R18 未完成
- 已有 R11 run folders: `run-0002`(旧)、`run-0010`(worker bundle，无 supervisor verdict)

## Proposed Changes

### 1. 补强 `packages/shared/test/community-plans.spec.ts` 无效契约测试

**文件**: [packages/shared/test/community-plans.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plans.spec.ts)

**改动 1a — 扩展 "rejects legacy model-result fields" 测试**
- 在现有 `legacyField` 数组中追加 `{ model: "gpt-4o" }` 和 `{ prompt: "..." }` 两项。
- 理由：用户明确点名 `model` 和 `prompt`，现有测试只覆盖 `generation_source`/`ai_status`/`usage`/`generated_by`。

**改动 1b — 扩展 "rejects unsafe place and event fields" 测试**
- Place 追加泄露字段：`address_en`、`gallery_urls`、`navigation`、`intro_zh`、`business_hours_zh`、`community_id`、`review_status`、`import_review`、`contact_phone`。
- Event 追加泄露字段：`organizer_user_id`、`review_status`、`publish_status`、`signup_deadline`、`address_text`、`contact_phone`、`capacity`（已有，保留）、`registration_count`。
- 理由：用户要求确认投影不泄露"详情、管理、容量、联系方式和审核字段"，现有测试只各测 1 个字段。

**改动 1c — 扩展 "rejects legacy arrays and unknown fields" 测试**
- 追加 PII 字段：`email`、`name`、`user_id`、`openid`。
- 理由：用户要求确认拒绝 PII，现有测试只覆盖 `phone`。

这三处改动都是向现有 `for...of` 数组追加条目，不新增 describe/it，不改任何 schema 或源码，最小必要。

### 2. 运行 shared typecheck 与 focused tests

```bash
pnpm --filter @community-map/shared typecheck
pnpm exec vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/community-plan-engine.spec.ts packages/shared/test/client.spec.ts
```

### 3. 新建 R11 validation run folder

**路径**: `auto_test_openspec/launch-trae-competition-h5-demo/run-0021__task-11.1__ref-R11__<YYYYMMDDThhmmssZ>/`

基于现有 `run-0010` 的 worker bundle 模式，创建：
- `task.md` — 自述：change-id、run#、task-id、ref-id、SCOPE: CLI、how to run、inputs/outputs、expected results
- `run.sh` — macOS/Linux：cd 到 bundle 目录，跑 shared typecheck + focused vitest，tee 到 `logs/run.log`
- `run.bat` — Windows 等价脚本
- `logs/` — 运行日志目录（含 `.gitkeep`）
- `tests/` — 不需要额外测试脚本，直接跑仓库现有 vitest

Run counter 取 `0021`（现有最高 `run-0020`）。时间戳用执行时的 UTC 时间。

### 4. 输出八项交付物

完成上述步骤后，在最终回复中输出：
1. 复核范围和发现
2. 修改文件
3. 运行命令及真实结果
4. 新建 validation run folder
5. 推荐保存的 TRAE 原始截图和产品截图
6. 当前完整 Session ID 的记录提醒
7. 建议 commit message
8. 未完成项和风险

## Assumptions & Decisions

- **Assumption**: 现有 28 个 community-plan 测试 + 4 个 client 测试已经覆盖核心正反向路径，本 Session 只补强用户点名的 `model`/`prompt` 和更全面的投影/PII 字段，不重写测试结构。
- **Decision**: 不修改任何 schema/contract/source，只修改测试文件 `community-plans.spec.ts`。
- **Decision**: 新 run folder 取 `run-0021`，遵循 append-only、不覆盖既有 run 的规则。
- **Decision**: 不执行 R18（部署），不进入下一阶段。
- **Assumption**: 用户提到的"参与需求"指 `accessibility_need`（无障碍支持需求），与 design.md 决策 2 一致。
- **Decision**: GUI 验证不在本 Session 范围（R11 是 SCOPE: CLI）。

## Verification steps

1. `pnpm --filter @community-map/shared typecheck` exit 0
2. `pnpm exec vitest run packages/shared/test/community-plans.spec.ts` 全部通过，含新增的 `model`/`prompt`/扩展投影/扩展 PII 断言
3. `pnpm exec vitest run packages/shared/test/community-plan-engine.spec.ts` 全部通过
4. `pnpm exec vitest run packages/shared/test/client.spec.ts` 全部通过
5. 新建 `run-0021__task-11.1__ref-R11__<timestamp>/` 包含 `task.md`、`run.sh`、`run.bat`、`logs/`
6. 执行 `run.sh` 生成 `logs/run.log`，记录真实 typecheck + vitest 输出
