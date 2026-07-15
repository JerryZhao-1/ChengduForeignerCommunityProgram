# 桐邻 First 120 Minutes｜R11 复核 + R16 主旅程精修

> 历史计划（已 superseded）：本文记录 HEAD `ff8b801a` 时的实施计划，不应在当前分支重复执行。R16 的 CLI 实施已进入后续提交；当前权威状态以 `openspec/changes/launch-trae-competition-h5-demo/tasks.md` 与 `docs/competition/trae-evidence-log.md` 为准。GUI 验证必须由具备 `playwright-mcp` 能力的 Supervisor 在全新 immutable run folder 中执行，禁止手工浏览器验收或回写 run-0033。

## Summary

本 Session 接管 `competition/trae-h5-demo` 分支上的“桐邻 First 120 Minutes｜社区策展融入路线”。当前 git tree 干净，HEAD `ff8b801a`。R11（shared 单选契约锁定）与 R15（mobile adapter/mock/offline parity）已有 PASS run（run-0031/0032），R16（judge flow + 文档）是缺口。

本计划做两件事：
1. **复核 R11 shared 契约**：确认 5 严格字段、单选、拒旧字段、响应四理由、无 AI 字段、只暴露 POST、安全投影；运行 shared typecheck + focused tests；若无代码改动则不新建 run folder，仅在最终报告记录复核结果。
2. **精修 R16 比赛主旅程**：核心改动是 `route-map.vue` 渲染完整两站有序路线（地点 + 活动），地图仍为可选增强；验证 welcome→complete 180s、地图降级、404 标记、zh/en 切换、refresh/deep link/Start Over、Demo Confirm 说明、DESIGN.md 视觉体系、390px 无横滚、焦点合格；新建 R16 run folder（CLI + MCP GUI runbook）。

两个独立 commit：
- `refactor(shared): lock deterministic community plan contracts`（仅当 R11 复核发现需补充测试时）
- `style(mobile): polish curated route judge journey`（route-map.vue + 必要 i18n 补全）

## Current State Analysis

### Git 状态
- Branch: `competition/trae-h5-demo`，working tree clean
- HEAD: `ff8b801a Strengthen community plan parity and contract tests`
- 历史 R1–R9 已 superseded；R10–R17 多数 PASS，R18（部署）待办

### R11 shared 契约现状（已 PASS，run-0031）
[packages/shared/src/schemas/community-plans.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/schemas/community-plans.ts) 已锁定：
- `NewResidentPreferenceSchema.strict()`：恰好 5 字段（`preferred_language` zh|en、`primary_interest` 8-enum、`arrival_context` 3-enum、`household_type` 4-enum、`accessibility_need` 6-enum 含 `none`），全部单选，`.strict()` 拒绝 `community_id`/PII/自由文本/未知字段
- `CommunityPlanSchema.strict().superRefine()`：`scenario_key` 正则 `^v1:(interest):(arrival):(household):(accessibility)$`、`catalog_version` literal `tongzilin-curated-v1`、`selection_explanation.reasons` 4-tuple 有序（primary_interest→arrival_context→household_type→accessibility_need）、items length 2（place_visit + event_attend）、total 120min、无 `generated_by`/`ai_status`/`usage`/`model`/`prompt`
- `CommunityPlanPlaceProjectionSchema`：`_id, name_zh, name_en, cover_url, category_level_1, is_recommended, location` — 无详情/管理/容量/联系/审核字段
- `CommunityPlanEventProjectionSchema`：`_id, title_zh, title_en, summary_zh, summary_en, start_time, end_time, cover_url` — 无容量/联系/审核字段
- [packages/shared/src/contracts/community-plans.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/contracts/community-plans.ts) 只暴露 `generate: POST /community-plan/generate`
- [packages/shared/src/contracts/paths.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/src/contracts/paths.ts) `communityPlan.generate` 只有一条
- 测试 [packages/shared/test/community-plans.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plans.spec.ts) 已覆盖：5 必选字段逐缺失、单选字段拒数组、legacy arrays/unknown/community_id/PII/free-text 拒绝

### R15 mobile adapter 现状（已 PASS，run-0032）
[apps/mobile/src/api/community-plan-adapter.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/api/community-plan-adapter.ts) 状态映射正确：
- 200 → success/online
- 400/403/404/409/429 → api_error（不 fallback）
- 5xx/transport/timeout → fallback/offline（调用同一 `generateLocalCommunityPlan`）
- `deliveryMode` 只在 adapter state，不进入 `CommunityPlanSchema`

### R16 judge 旅程现状（缺口）
[apps/mobile/src/stores/onboarding-store.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/stores/onboarding-store.ts)：
- `getCompletionProgress` 正确排除 `unavailable` 地点，`canFinish` 要求 visitedPlaces===availablePlaces 且 confirmedEvents===eventItems
- `markPlaceUnavailable` / `markPlaceVisited` / `confirmDemoEvent` / `finish` / `reset` 状态机完整

[apps/mobile/src/pages/onboarding/welcome.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/welcome.vue)：
- H5 guest entry（judge/plan），`#ifndef H5` 显示 mp-only placeholder，键盘可操作，符合 DESIGN.md 色板

[apps/mobile/src/pages/onboarding/preferences.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/preferences.vue)：
- 4 步单选，`role=radio`/`aria-checked`/键盘 Enter/Space/可见焦点，generating 步骤依次显示，refresh/deep link 守卫

[apps/mobile/src/pages/onboarding/plan.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/plan.vue)：
- 摘要 + 透明说明 + 四维理由 + 地点/活动卡 + Finish，place detail 404 标记 unavailable，`demo-disclosure` 说明不创建报名，`finish` 受 `canFinish` 门禁

[apps/mobile/src/pages/onboarding/route-map.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/route-map.vue) — **核心缺口**：
- 当前只渲染 `placeItems`（`item.type === "place_visit"`），不渲染 event_attend 卡片
- 与设计规格“结构化路线清单为基础能力”不一致；plan.vue 已有完整两站 list，route-map 应保持一致
- `mapUnavailable` 静态提示合理（地图为可选增强），但路线清单应完整

[apps/mobile/src/pages/onboarding/complete.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/complete.vue)：
- 进度展示 + unavailable 分母调整 + `demoDisclosure` + Start Over，符合设计

i18n [apps/mobile/src/i18n/catalog.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts)：
- `route` 已有 `title/subtitle/mapUnavailable/imageUnavailable/back/openPlace/coordinates`，但缺 `openEvent`（活动卡的查看按钮文案）
- zh/en 递归 key 一致

## Proposed Changes

### Task 1: R11 shared 契约复核（只读验证 + 可能补测试）

**步骤：**
1. 运行 `pnpm --filter @community-map/shared typecheck`
2. 运行 `./node_modules/.bin/vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts`
3. 核对测试覆盖：5 必选字段逐缺失、单选拒数组、legacy/unknown/community_id/PII/free-text 拒绝、响应四理由有序、无 AI 字段、只暴露 POST、安全投影字段集
4. 若发现覆盖缺口 → 补充 named assertion 测试到 [packages/shared/test/community-plans.spec.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/packages/shared/test/community-plans.spec.ts)，commit `refactor(shared): lock deterministic community plan contracts`
5. 若无缺口 → 不新建 run folder，仅在最终报告记录“R11 复核 PASS，run-0031 仍有效”

**预期结果：** typecheck exit 0，focused tests 全 PASS。现有 76/76 tests（run-0031）应仍 PASS。

### Task 2: R16 比赛主旅程精修

#### 改动 2.1: route-map.vue 渲染完整两站有序路线
**文件：** [apps/mobile/src/pages/onboarding/route-map.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/route-map.vue)

**What:** 将 `placeItems`（只过滤 place_visit）改为 `routeItems`（`plan.items` 全部两站按序），活动卡复用 plan.vue 的事件展示模式（标题、摘要、查看活动按钮）。

**Why:** 设计规格“结构化路线清单为基础能力”要求路线清单包含完整两站；当前只显示地点卡，活动站在路线页缺失。

**How:**
- `placeItems` computed → `routeItems` = `onboarding.state.plan?.items ?? []`
- 模板 `v-for` 遍历 `routeItems`，按 `item.type` 分支渲染：
  - `place_visit`：保持现有地点卡（cover、name、coordinates、查看地点）
  - `event_attend`：新增活动卡（title、summary、查看活动按钮；无 cover 也可，或复用 event.cover_url）
- 保持 `mapUnavailable` 提示（地图为可选增强，路线清单完整可用）
- 保持 `failedCoverIds` 逻辑用于地点图片降级
- 键盘焦点、`role=button`、`tabindex`、`:focus-visible` 一致

#### 改动 2.2: i18n catalog 补 route.openEvent
**文件：** [apps/mobile/src/i18n/catalog.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts)

**What:** 在 zh `route` 块加 `openEvent: "查看活动"`，en `route` 块加 `openEvent: "View event"`。

**Why:** route-map.vue 活动卡需要“查看活动”按钮文案，当前 catalog 只有 `openPlace`。

**How:** 严格按现有 zh/en 递归 key 一致规则，在两处 `route:` 对象内 `openPlace` 后追加 `openEvent`。

#### 改动 2.3: 验证清单（只读检查，不改代码除非发现问题）
- welcome→complete 180s：仅通过 MCP runbook 计时并留存证据
- 地图 SDK/key 缺失时路线清单完整可操作：route-map.vue 改后两站均可点
- 地点访问、Demo Confirm、Finish Route 状态正确：plan.vue 现有逻辑复核
- 地点 detail 404 标记 unavailable 并调整完成分母：plan.vue `openPlace` catch + `markPlaceUnavailable` + complete.vue `availablePlaces`
- 切换中英文不丢失当前计划：`app.setLocale` 只改 locale，不重置 plan；plan.vue 用 `appState.locale` 渲染
- refresh、无状态 deep link、Start Over：各页 `onMounted` 守卫 + `reset()` + `reLaunch`
- Demo Confirm 附近明确说明不创建报名：plan.vue `demo-disclosure` + complete.vue `demoDisclosure`
- DESIGN.md field-guide 视觉体系：色板 `#F6F0E5/#0F766E/#123B3A/#E66A45/#D39A3A`、Fraunces/Songti SC、dashed 编辑性分隔、390px 单列、桌面 max-width 居中
- 390px 无横滚：chip-grid `flex-wrap`、option-row `flex-wrap`、page `max-width` + `margin: 0 auto`
- 桌面 max-width 合理：plan/route-map `max-width: 960rpx`，welcome `max-width: 750rpx`
- 按钮和键盘焦点合格：`min-height: 88rpx`、`:focus-visible` outline `#D39A3A`、`role=button`/`tabindex`/`@keyup.enter`/`@keyup.space.prevent`
- 不引入新 UI 库、不加 AI 科技风/emoji 图标/无意义动画

#### 改动 2.4: 新建 R16 validation run folder
**路径：** `auto_test_openspec/launch-trae-competition-h5-demo/run-0033__task-16.1__ref-R16__<YYYYMMDDThhmmssZ>/`

**内容（Worker bundle，不写 PASS/FAIL）：**
- `task.md`：change-id=launch-trae-competition-h5-demo, run#=0033, task-id=16.1, ref-id=R16, SCOPE=MIXED
  - CLI: mobile typecheck + mobile adapter/store/onboarding tests
  - GUI: MCP-only runbook `tests/gui_runbook_judge_journey.md`
  - 验证项：四代表画像、zh/en、390px/桌面、地图降级、完整闭环 180s
  - 预期：typecheck exit 0、tests PASS、GUI 截图证明 welcome→complete 闭环
- `run.sh` / `run.bat`：start-server only（启动 mobile H5 dev server，打印 URL）
- `tests/gui_runbook_judge_journey.md`：MCP-only 步骤 + 断言点（无浏览器自动化脚本）
- `tests/test_cli_judge_journey.sh`（或 .ts）：CLI typecheck + focused tests
- `logs/`、`outputs/screenshots/`（执行后由 Supervisor 填充）

**执行：**
1. 运行 `pnpm --filter @community-map/mobile typecheck`
2. 运行 `./node_modules/.bin/vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts`
3. MCP GUI runbook 执行（需启动 mobile H5 dev server，验证四画像 zh/en + 地图降级 + 闭环）

#### 改动 2.5: 更新 tasks.md R16 状态与 evidence log
**文件：** [openspec/changes/launch-trae-competition-h5-demo/tasks.md](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/openspec/changes/launch-trae-competition-h5-demo/tasks.md) + [docs/competition/trae-evidence-log.md](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/docs/competition/trae-evidence-log.md)

**What:** R16 已是 `[x]`，但需补 BUNDLE/EVIDENCE bookkeeping 行；evidence log 补 S11 TRAE Session ID 占位（`<copy-from-TRAE-UI>`，不虚构）。

## Assumptions & Decisions

1. **R11 不新建 run folder**：run-0031 已 PASS 且为 authoritative corrective retry，若无代码改动则不新建，仅在最终报告记录复核结果。若发现测试覆盖缺口则补测试并新建 run-0034。
2. **R15 不新建 run folder**：run-0032 已 PASS，mobile adapter 无契约改动（route-map.vue 是 UI 层），不新建。
3. **R16 新建 run-0033**：因 R16 是缺口，且 route-map.vue 有实质代码改动。
4. **route-map.vue 活动卡**：复用 plan.vue 事件展示模式，但不带 Demo Confirm 按钮（Demo Confirm 留在 plan.vue，route-map 只展示路线 + 查看入口）。
5. **不引入新 UI 库**：route-map.vue 活动卡用现有 `<button class="action primary">` 样式，与地点卡视觉一致。
6. **不虚构 TRAE Session ID**：evidence log S11 行保持 `<copy-from-TRAE-UI>` 占位，由 user 从 TRAE UI 复制填入。
7. **不虚构截图/URL**：GUI 证据由 MCP runbook 实际执行后产生。
8. **地图仍为可选增强**：route-map.vue 不引入腾讯地图 SDK，保持 `mapUnavailable` 提示 + 完整路线清单。
9. **commit 顺序**：先 `refactor(shared)`（若有），再 `style(mobile)`。
10. **不进入 R18（部署）**：本 Session 只到 R16 验证。

## Verification Steps

### Task 1 验证
```bash
pnpm --filter @community-map/shared typecheck
./node_modules/.bin/vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts
```
预期：typecheck exit 0；tests 全 PASS（run-0031 的 76/76 应仍 PASS）。

### Task 2 验证
```bash
pnpm --filter @community-map/mobile typecheck
./node_modules/.bin/vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts
pnpm --filter @community-map/mobile build:h5
pnpm --filter @community-map/mobile build:mp-weixin
```
预期：typecheck exit 0；tests 全 PASS；H5/mp-weixin build 成功（mp-weixin 不暴露比赛入口）。

### R16 GUI 验证（MCP runbook）
启动 `VITE_API_MODE=mock pnpm --filter @community-map/mobile dev:h5`，按 `tests/gui_runbook_judge_journey.md` 执行：
1. 四代表画像（community-service/solo、food-drink/family-with-kids、social/couple、outdoor-sports/shared）zh/en 完成 welcome→complete
2. 390px + 桌面两列视口
3. 地图降级（route-map 路线清单完整两站可操作）
4. 地点 404 标记 unavailable + 完成分母调整
5. zh/en 切换不丢计划
6. refresh/deep link 回 welcome
7. Start Over 回 welcome
8. 计时 < 180s

### OpenSpec 校验
```bash
openspec validate launch-trae-competition-h5-demo --strict --no-interactive
```
预期：PASS（tasks.md 格式与 specs 一致）。
