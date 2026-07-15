# 复核并完善 H5 onboarding 和 plan 页面

## Summary

接管 `competition/trae-h5-demo` 分支上"桐邻 First 120 Minutes｜社区策展融入路线"。复核现有 H5 onboarding（welcome / preferences / plan / route-map / complete）与 store / adapter / i18n 实现，仅做必要修正，并新建 R14 validation run folder。

经 Phase 1 探查，现有实现已满足绝大部分要求（四步流程、键盘可操作单选、`none` 文案、生成态透明文案、"为什么这样匹配"+四理由、无 AI/模型字段、离线徽章、44px 触控目标、焦点可见、mp-weixin H5-only 边界）。**唯一违规**：3 处硬编码 `Tongzilin · 桐梓林` eyebrow 文案绕过中央 zh/en catalog，违反"全部系统文案来自中央 zh/en catalog"。

## Current State Analysis

### 已满足的要求（无需改动）

| 要求 | 现状 | 证据 |
| --- | --- | --- |
| 四步流程收集 5 字段 | step1 语言、step2 兴趣、step3 到达+家庭、step4 参与需求 | [preferences.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/preferences.vue#L56-L70) |
| 兴趣/参与需求 keyboard-operable 单选，后选覆盖前选 | `role="radio"`+`tabindex="0"`+`keyup.enter/space`；`selectInterest`/`selectAccessibilityNeed` 调 `updateDraft` 替换 | [preferences.vue:85-96](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/preferences.vue#L85-L96) |
| none 显示"无额外需求 / No additional need" | catalog `accessibilityNeeds.none` 双语齐全 | [catalog.ts:233,544](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts#L232-L239) |
| 生成态透明文案 | `generating.checkTime/matchPlaces/organizeTips/prepareRoute` 双语齐全 | [catalog.ts:240-246,551-557](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts#L240-L246) |
| 方案页"为什么这样匹配"+双语摘要+四理由 | `explanationTitle`+`summaryText`+`reason-list` 迭代 `selection_explanation.reasons` | [plan.vue:150-166](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/plan.vue#L150-L166) |
| 不显示 AI/模型/generated_by/provider status | grep 确认 onboarding 页面无 AI/model/provider 字段 | 探查结果 |
| 离线只显示"使用同版本本地社区目录" | `offlineNotice = "离线演示 · 使用同版本本地社区目录"` | [catalog.ts:249,560](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts#L249) |
| 不显示 raw enum | dimension/type 全部经 `dimensionLabels`/`itemTypes` 映射 | plan.vue / preferences.vue |
| 390px + 桌面可用 | `max-width` + `@media (min-width:768px)` | welcome.vue / preferences.vue |
| 触控目标 ≥44px | `min-height: 88rpx`（≈46px @390px） | 各 vue 样式 |
| 焦点可见 | `:focus-visible { outline: 4rpx solid #d39a3a }` | 各 vue 样式 |
| mp-weixin 只显示 H5-only 边界 | `#ifdef H5` / `#ifndef H5` 分隔 + `mpOnly` 块；onboarding 不在 tabBar | pages.json:207-229（tabBar 不含 onboarding） |
| 首页比赛入口 H5-only | competition-hero 在 `#ifdef H5` 块内 | [home/index.vue:72-105](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/home/index.vue#L72-L105) |

### 发现的问题（需修正）

**违规：硬编码 eyebrow 文案绕过中央 catalog**

3 处 `<view class="...-eyebrow">Tongzilin · 桐梓林</view>` 直接写死，违反 `docs/ui-guidelines.md §4` 与 `mobile-language-experience` spec"所有系统拥有的标题、标签…必须来自中央 Mobile catalog"：

1. [home/index.vue:75](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/home/index.vue#L75)（H5-only 块内）
2. [welcome.vue:32](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/welcome.vue#L32)
3. [complete.vue:56](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/complete.vue#L56)

## Proposed Changes

### 1. 在中央 catalog 新增 `brandEyebrow` key

**文件**：[apps/mobile/src/i18n/catalog.ts](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/catalog.ts)

**改什么**：在 `onboarding` 块的 zh 和 en 两端各新增 `brandEyebrow` 字段。这是一个双语品牌标记（同时展示两个名称），zh/en 取相同值 `"Tongzilin · 桐梓林"`，与现有视觉行为一致。

**为什么**：把硬编码文案纳入中央 catalog，满足递归 zh/en 键一致约束（catalog.spec.ts 已有 leaf-key parity 测试自动覆盖）。catalog 类型层有 `WidenCatalog` + `englishCatalogParity`/`chineseCatalogParity` 编译期校验，新增键必须两端同时加，否则 typecheck 失败。

**怎么改**：
- zh `onboarding` 块（约 L187 之前，`heroTitle` 上方或紧邻）加 `brandEyebrow: "Tongzilin · 桐梓林",`
- en `onboarding` 块（约 L497 之前）加 `brandEyebrow: "Tongzilin · 桐梓林",`

### 2. 替换 3 处硬编码 eyebrow

**文件 a**：[apps/mobile/src/pages/home/index.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/home/index.vue#L75)
- `<view class="hero-eyebrow">Tongzilin · 桐梓林</view>` → `<view class="hero-eyebrow">{{ onboardingCopy.brandEyebrow }}</view>`

**文件 b**：[apps/mobile/src/pages/onboarding/welcome.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/welcome.vue#L32)
- `<view class="eyebrow">Tongzilin · 桐梓林</view>` → `<view class="eyebrow">{{ copy.brandEyebrow }}</view>`（welcome.vue 用 `copy` = `getMobileCopy(appState.locale).onboarding`）

**文件 c**：[apps/mobile/src/pages/onboarding/complete.vue](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/src/pages/onboarding/complete.vue#L56)
- `<view class="eyebrow">Tongzilin · 桐梓林</view>` → `<view class="eyebrow">{{ copy.brandEyebrow }}</view>`（complete.vue 用 `copy`）

### 3. 运行 CLI 验证

按 R14 TEST 要求执行：
```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run \
  apps/mobile/src/stores/onboarding-store.spec.ts \
  apps/mobile/src/api/community-plan-adapter.spec.ts \
  apps/mobile/src/i18n/catalog.spec.ts
```
预期全部 exit 0。catalog.spec.ts 的 leaf-key parity 测试会验证新键两端一致。

### 4. 新建 validation run folder

**路径**：`auto_test_openspec/launch-trae-competition-h5-demo/run-0026__task-14.1__ref-R14__<当前UTC时间戳>/`
（当前已有 run-0025，下一个 run 计数器为 0026）

**内容**（参照 run-0013 结构）：
- `task.md`：change-id / run# / task-id / ref / SCOPE:MIXED / 启动方式 / 输入输出 / 预期（CLI exit 0 + 单选/none/离线徽章/四理由/44px/焦点/双语）
- `run.sh` / `run.bat`：GUI/MIXED start-server only，仅启动 H5（`VITE_API_MODE=mock pnpm --filter @community-map/mobile dev:h5`）并打印 `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`，不做数据准备/测试/探针
- `tests/gui_runbook_onboarding.md`：MCP-only 步骤（390px+1280px、zh/en、键盘单选、none、离线徽章、四理由顺序、44px、focus-visible），无浏览器自动化脚本
- `logs/`（.gitkeep）、`outputs/`（.gitkeep）

Worker 只准备 bundle，不写 PASS/FAIL。

### 5. MCP GUI 验证（中英文）

Codex Supervisor 已在 forced-mock H5 上执行 `tests/gui_runbook_onboarding.md`：
- 390 × 844 英文流程：用键盘依次激活两个兴趣和两个参与需求，确认后选覆盖前选；生成页显示离线徽章、summary 和四理由顺序。证据：`outputs/en-mobile-focus-visible.png`、`outputs/en-mobile-local-plan-viewport.png`、`outputs/en-mobile-local-plan.png`。
- 1280 × 900 中文 example profile：生成页显示中文离线徽章、summary 和四条中文理由。证据：`outputs/zh-desktop-local-plan.png`。
- 最终 GUI/CLI 断言与 PASS 判定：`logs/gui-screenshot-index.md`、`logs/supervisor-verdict.md`。

## Assumptions & Decisions

- **eyebrow 取值**：zh/en 均为 `"Tongzilin · 桐梓林"`（双语品牌标记，与现状一致，最小视觉变更）。catalog parity 约束的是键结构，非值，相同值合法。
- **不重写现有实现**：现有四步流程、store、adapter、catalog 已满足要求，仅修正硬编码 eyebrow。遵循 AGENTS.md"最小必要改动，不做无关重构"。
- **run 计数器**：当前最大 run-0025，新 run 取 0026。时间戳在执行时用 `date -u +%Y%m%dT%H%M%SZ` 生成。
- **不修改历史 run folder**：run-0001..run-0025 不可变，新证据入新 run。
- **不虚构**：TRAE Session ID、截图、公开 URL、部署状态均不编造；GUI 截图仅在真正执行 MCP 后保存。

## Verification steps

1. `pnpm --filter @community-map/mobile typecheck` → exit 0（含 catalog 编译期 parity 校验）
2. `pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts` → 全绿
3. grep 确认 `apps/mobile/src/pages/onboarding` 与 `apps/mobile/src/pages/home/index.vue` 中不再有硬编码 `Tongzilin · 桐梓林`
4. 新 run folder 结构符合 openspec/project.md §Validation bundle requirements
5. MCP runbook 中英文截图 + 断言已记录到 `logs/gui-screenshot-index.md`；Supervisor verdict 为 PASS
