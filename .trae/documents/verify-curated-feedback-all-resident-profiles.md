# 复核 plan：策展目录 / matcher / fixtures / 穷举测试

> Session 范围：`competition/trae-h5-demo` 分支上 "桐邻 First 120 Minutes｜社区策展融入路线" 的 `packages/shared` 策展目录、matcher、fixtures 与穷举测试复核。
> OpenSpec 任务对应：R12（curated catalog + matcher + exhaustive coverage）。
> 不进入下一阶段（R18 部署等）。

---

## 1. 当前状态分析（基于 Phase 1 探索）

### 1.1 实现已具备的能力（已通过阅读源码 + 测试确认）

| 要求 | 实现位置 | 当前是否满足 |
| --- | --- | --- |
| `catalog_version = "tongzilin-curated-v1"` | [community-plans.ts:145-148](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/schemas/community-plans.ts) `COMMUNITY_PLAN_CATALOG_VERSION` + literal schema | ✅ |
| 21 模块全部非空 zh/en | [narration.ts:154-332](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/narration.ts) `COMMUNITY_PLAN_FEEDBACK_CATALOG`，由 `CommunityPlanFeedbackCatalogSchema.parse` 在模块加载时强制 | ✅ |
| 8 兴趣 + 3 到达 + 4 家庭 + 6 参与 = 21 | [community-plans.ts:6-61](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/schemas/community-plans.ts) 四个 enum 数组 | ✅ |
| 稳定 `scenario_key` | [engine.ts:55-70](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/engine.ts) `buildCommunityPlanScenarioKey`，不含 `preferred_language` | ✅ |
| 摘要 + 4 条选择理由 | [engine.ts:226-310](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/engine.ts) `buildPlaceEventPlan`，按固定顺序组装 | ✅ |
| 每条理由等于对应预写模块 | [engine.ts:235-238, 250-271](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/engine.ts) `getInterestFeedback` 等通过 `requireCatalogEntry` 取模块；测试 [community-plan-engine.spec.ts:64-101](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) 字节级比对 `reason.text_zh === module.reason_zh && reason.text_en === module.reason_en` | ✅ |
| 地点稳定排序，分数相同时按 `_id` | [engine.ts:194-199](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/engine.ts) `.sort((l,r) => r.score - l.score || l.place._id.localeCompare(r.place._id))` | ✅ |
| 时间/随机/插入顺序/语言不改语义 | engine 为纯函数；不调用 `Math.random`；`now` 由 fixtures 固定；[community-plan-engine.spec.ts:103-119](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) `expect(enPlan).toEqual(zhPlan)` | ✅ |
| `accessibility_need` 仅解释/准备提示 | [narration.ts:282-331](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/narration.ts) 全部含 "目录没有认证 / does not certify" | ✅ |
| 缺少策展地点/活动明确失败 | [engine.ts:204-213](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/community-plan/engine.ts) 抛错；[community-plan-engine.spec.ts:218-246](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) 三个失败测试 | ✅ |
| provider / local 共享同一安全 bundle | [community-plan-offline-bundle.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/mock/community-plan-offline-bundle.ts) `communityPlanCatalogBundle`；API mock/cloudbase + mobile adapter 都调用 `createCompetitionDemoEngineInput` + `generateCommunityPlan` | ✅ |

### 1.2 测试现状（`packages/shared/test/`）

- [community-plan-engine.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) 穷举 576 + 1,152 + 理由匹配 + zh/en 深度相等 + 失败 + judge 场景。
- [community-plans.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plans.spec.ts) 严格契约 + 安全投影 + 21 模块计数（line 180-185）+ 模型字段拒绝。
- [apps/api/test/community-plan.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/api/test/community-plan.spec.ts) 576 provider + guest 安全 + limiter + 4xx。
- [apps/mobile/src/api/community-plan-adapter.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/community-plan-adapter.spec.ts) 576/576 在线/离线语义指纹相等。

### 1.3 唯一必要修正

[community-plan-engine.spec.ts:121-142](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts) 的 "reports the required machine-decidable coverage summary" 测试块当前只输出了 7 项要求中的 5 项：

```ts
const summary = {
  logicalScenarios: scenarios.length,                    // 576 ✓
  uniqueScenarioKeys: ...,                              // 576 ✓
  localizedRenderCases: ...,                            // 1152 ✓
  invalidPlans: ...,                                    // 0 ✓
  missingCopy: ...                                      // 0 ✓
};
// 缺：
//   bilingualDimensionModules: 21
//   reasonModuleMismatches: 0
```

用户明确要求："测试必须证明：21 modules、576 scenarios、576 unique keys、1,152 localized cases、0 invalid plans、0 missing copy、0 reason/module mismatch。**输出机器可读 coverage summary。**"

→ 必须补齐 `bilingualDimensionModules` 与 `reasonModuleMismatches` 两个字段，使机器可读 summary 完整覆盖 7 项指标。

### 1.4 历史 / 既有证据（不修改）

- `auto_test_openspec/launch-trae-competition-h5-demo/` 已有 run-0001 ~ run-0022。
- [docs/competition/trae-evidence-log.md](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/docs/competition/trae-evidence-log.md) 中 S07C（"策展目录与 576 组合 matcher"）的 Session ID 已由用户从 TRAE UI 复制并标记为 `Done`。
- R1–R9 / 旧 AI 截图作为 superseded 证据保留，不修改。
- R18（独立公开部署）在本 Session 不处理。

---

## 2. 提议的修改（最小必要）

### 修改 1（必要）：补全机器可读 coverage summary

**文件**：[packages/shared/test/community-plan-engine.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plan-engine.spec.ts)

**位置**：第 121-142 行 `it("reports the required machine-decidable coverage summary", ...)` 测试块。

**改动**：在 `summary` 对象中追加两个字段，并在期望中追加对应断言：

```ts
const catalog = COMMUNITY_PLAN_FEEDBACK_CATALOG;
const bilingualDimensionModules =
  Object.keys(catalog.primary_interest).length +
  Object.keys(catalog.arrival_context).length +
  Object.keys(catalog.household_type).length +
  Object.keys(catalog.accessibility_need).length;

const reasonModuleMismatches = plans.filter((plan, index) =>
  plan.selection_explanation.reasons.some((reason) => {
    const module = catalogEntryFor(scenarios[index], reason.dimension);
    return (
      !module ||
      reason.text_zh !== module.reason_zh ||
      reason.text_en !== module.reason_en
    );
  })
).length;

const summary = {
  bilingualDimensionModules,            // 21
  logicalScenarios: scenarios.length,    // 576
  uniqueScenarioKeys: new Set(plans.map((plan) => plan.scenario_key)).size,  // 576
  localizedRenderCases: enumerateCommunityPlanLocalizedCases().length,       // 1152
  invalidPlans: plans.filter((plan) => !CommunityPlanSchema.safeParse(plan).success).length,  // 0
  missingCopy: plans.filter((plan) =>
    plan.selection_explanation.reasons.some((reason) => !reason.text_zh || !reason.text_en)
  ).length,                              // 0
  reasonModuleMismatches                 // 0
};
expect(summary).toEqual({
  bilingualDimensionModules: 21,
  logicalScenarios: 576,
  uniqueScenarioKeys: 576,
  localizedRenderCases: 1152,
  invalidPlans: 0,
  missingCopy: 0,
  reasonModuleMismatches: 0
});
```

**说明**：`catalogEntryFor` 辅助函数已在该测试块前一个 `it` 中定义（line 65-87），可直接复用。无需新增 import。

**影响范围**：仅 `packages/shared/test/community-plan-engine.spec.ts` 一个文件。不动 schema、契约、engine、provider、UI、文档（除 evidence log 与新 run folder）。

### 修改 2（必要）：新建 R12 复核 validation run folder

**目录**：`auto_test_openspec/launch-trae-competition-h5-demo/run-0023__task-12.1__ref-R12__<YYYYMMDDThhmmssZ>/`

> 时间戳取执行时刻（UTC，格式 `YYYYMMDDThhmmssZ`，例如 `20260715T...Z`）。R12 是 "Curated catalog and matcher" 的 OpenSpec 任务编号，与本 Session 复核范围一致。

包含以下不可变文件：

1. **`task.md`** — 任务说明：scope=CLI、ref=R12、HEAD commit、运行命令、acceptance criteria 摘要。
2. **`tests/verify-vitest.mjs`** — Node ESM 脚本，调用 `vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts --reporter=json` 并解析输出，写入 `outputs/coverage-summary.json`。脚本只读取测试结果，不修改既有 run folder。
3. **`outputs/result.json`** — Supervisor verdict（PASS/FAIL）、HEAD commit、运行时间、命令、exit codes、coverage summary 摘要。
4. **`outputs/coverage-summary.json`** — 从测试输出中提取的机器可读 coverage summary（7 项指标 + provider/local parity 引用）。
5. **`logs/run.log`** — 真实的 typecheck + vitest 输出（不裁剪、不伪造）。

**不修改**任何既有 run folder（run-0001 ~ run-0022）。

### 修改 3（必要）：更新 evidence log

**文件**：[docs/competition/trae-evidence-log.md](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/docs/competition/trae-evidence-log.md)

**改动**：
- 在 S07C 行填写 Date（今日）与 Commit（执行后由 user 确认或填 `<pending-commit>`，不伪造 hash）。
- 在"本地验证状态（非 TRAE Session）"表追加一行：
  - Run: `0023`
  - Task: `R12 curated catalog/matcher exhaustive review`
  - Result: PASS（执行后确认）
  - Evidence: `auto_test_openspec/launch-trae-competition-h5-demo/run-0023__task-12.1__ref-R12__<timestamp>/`
  - Boundary: `Codex/local CLI 复核证据；不替代 TRAE Session、GUI 或 R18 公开部署证据。Session ID 已由 user 从 TRAE UI 复制。`
- S07C 的 Session ID 已由用户从 TRAE UI 复制；CLI 验证不独立认证或伪造 TRAE Session ID。

### 不做的事（明确边界）

- 不动 `apps/api/`、`apps/mobile/`、`packages/shared/src/` 任何源码 — 实现已正确。
- 不重构 engine / matcher / catalog / fixtures。
- 不补"accessibility 5 个非 none 值的免责声明断言"（当前测试只断言 `wheelchair`）— 实现已合规，属未来可加固项，记入风险。
- 不补 `_id` tiebreak 专用测试 / `Math.random` 未调用 spy — 实现已正确，属未来可加固项。
- 不补 `preferred_language` 独立性专用测试标签 — 已由 `expect(enPlan).toEqual(zhPlan)` 深度覆盖。
- 不进入 R18（独立公开部署）。
- 不修改任何既有 auto_test_openspec run folder。
- 不虚构 TRAE Session ID、测试结果、截图、公开 URL 或部署状态。

---

## 3. 验证步骤

### 3.1 修改前基线

```bash
pnpm --filter @community-map/shared typecheck
./node_modules/.bin/vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts
```

预期：全部通过（HEAD `cafddb2c` 已确认）。

### 3.2 修改后验证

```bash
# 1. typecheck
pnpm --filter @community-map/shared typecheck

# 2. 穷举测试（含补全后的 coverage summary）
./node_modules/.bin/vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts

# 3. 全量 shared 测试（确认无回归）
./node_modules/.bin/vitest run packages/shared/test/

# 4. lint（仅 shared 修改的测试文件）
pnpm lint
```

**通过标准**：
- typecheck exit 0
- vitest 全部 PASS
- `reports the required machine-decidable coverage summary` 测试断言 `bilingualDimensionModules: 21` 与 `reasonModuleMismatches: 0`
- coverage summary 7 项指标全部命中：21 / 576 / 576 / 1152 / 0 / 0 / 0

### 3.3 生成 validation run folder

```bash
TS=$(date -u +%Y%m%dT%H%M%SZ)
RUN_DIR="auto_test_openspec/launch-trae-competition-h5-demo/run-0023__task-12.1__ref-R12__${TS}"
mkdir -p "$RUN_DIR"/{tests,outputs,logs}
# 写入 task.md / verify-vitest.mjs
# 执行脚本，重定向输出到 logs/run.log
node "$RUN_DIR/tests/verify-vitest.mjs" > "$RUN_DIR/logs/run.log" 2>&1 || true
# 校验 outputs/coverage-summary.json 的 7 项指标
```

### 3.4 OpenSpec 校验（不动 change，仅复跑）

```bash
openspec validate launch-trae-competition-h5-demo --strict --no-interactive
```

---

## 4. 假设与决策

- **Assumption**：run folder 序号取 `0023`（基于已存在 run-0001 ~ run-0022 推断；执行前会用 `LS auto_test_openspec/launch-trae-competition-h5-demo/` 二次确认）。
- **Assumption**：本 Session 不需要在 Windows 主机实跑 `verify-vitest.mjs`（与既有 R10/R11 boundary 一致：Windows 脚本审查但不实跑）。
- **Decision**：`verify-vitest.mjs` 只调用 vitest JSON reporter，不引入新依赖。
- **Decision**：不动 S07C 的 Session ID 字段；由 user 从 TRAE UI 复制后填入。
- **Decision**：不动 `trae-ai-free-handoff-prompts.md`、`submission-draft.md` 等既有 docs（不在本 Session 复核范围内）。

---

## 5. 完成后输出（最终响应将包含）

按用户要求，最终响应将输出：

1. **复核范围和发现** — 已在上文 §1 详述。
2. **修改文件** — 列出 3 处修改（test 文件 / 新 run folder / evidence log）。
3. **运行命令及真实结果** — typecheck / vitest / OpenSpec validate 的 exit code 与关键输出摘要。
4. **新建 validation run folder** — 路径与内含文件清单。
5. **TRAE 原始截图和产品截图** — 已通过 Computer Use 从 live TRAE / VS Code 保存 Session ID、复核过程、vitest PASS 与 coverage summary 截图到 `docs/competition/evidence/trae-sessions/S07C/`，不伪造。
6. **当前完整 Session ID 的记录** — user 从 TRAE UI 复制的 S07C Session ID 已填入 evidence log；CLI Session 不冒充 TRAE Session。
7. **建议 commit message** — `feat(shared): verify curated feedback for all resident profiles`（按用户建议），并在 body 中列出 coverage summary 与 run folder 路径。
8. **未完成项和风险** — 见下。

---

## 6. 未完成项和风险

### 未完成（本 Session 不处理）
- **R18 独立公开部署 + 外部在线/离线验收**：完全 open。
- **R12–R16 各自的 Supervisor PASS**：当前只有 R10 / R11 / R17 有 late-stage Supervisor PASS（详见 evidence log 第 53-63 行）。本 Session 给出 R12 复核 PASS，但 R13–R16 仍需各自 Supervisor 验证。
- **S08–S15 TRAE Session 证据**：仍为 `PENDING-TRAE-EVIDENCE`，需 user 在 TRAE UI 中完成并复制 Session ID；S07C 已记录。
- **GUI / MCP runbook 验证**：本 Session 为 CLI 范围，GUI 证据不在范围。

### 风险（已识别，本 Session 不修）
- `apps/mobile/src/api/client.ts` 第 49/85/103 行存在 3 处 `as any`（pre-existing，违反 AGENTS.md "不使用 any/as any" 约定，但与本 Session 复核范围无关）。
- accessibility 免责声明测试只覆盖 `wheelchair`；其余 4 个非 `none` 值（`low-vision`/`low-mobility`/`hearing-support`/`quiet-environment`）实现合规但未单独断言（未来可加固）。
- 无 `_id` tiebreak 专用测试 / 无 `Math.random` 未调用 spy（实现正确，测试覆盖间接）。
- `apps/mobile/src/api/community-plan-adapter.spec.ts` 用了 `as never` / `as typeof fakePlan`（pre-existing test cast，不属本 Session 修改范围）。
- R18 部署后版本快照可能过时；release 前需复核 catalog bundle 来源 place/event 仍合适。
