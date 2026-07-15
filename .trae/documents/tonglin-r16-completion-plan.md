# 桐邻 R16 收尾计划 — MCP Supervisor 验证

## Summary

R16 的产品实现与 CLI preflight 已在 `b1b4a969` 完成，S11 TRAE Session ID 已在 `3218f692` 记录。run-0033 保留为 immutable 的部分证据：CLI 6/6 PASS，但 GUI 未执行，且缺少 GUI screenshots/output index，因此不能作为 R16 的最终 PASS 证据。

当前唯一收尾目标是由具备 `playwright-mcp` 能力的 Supervisor 在全新 run folder 中完成 MIXED 验证。不得手工操作浏览器，不得修改或补写 run-0033，也不得在最终 GUI PASS 前将 R16 标记为完成。

## Current State Analysis

### 已完成

| 项 | 状态 | 证据 |
|---|---|---|
| route-map.vue 两站有序渲染 | 已实现 | `routeItems`、`place_visit` 与 `event_attend` 分支 |
| catalog.ts openEvent 中英文案 | 已实现 | zh `查看活动`、en `View event` |
| run-0033 CLI preflight | PASS | `logs/preflight.log`，6/6 checks |
| S11 TRAE Session ID | 已记录 | `docs/competition/trae-evidence-log.md` |

### 尚未完成

1. 四代表画像 × zh/en 的 MCP GUI 验证。
2. 390px/1280px、地图降级、404、语言切换、refresh/deep link、Start Over 与 180 秒闭环的截图证据。
3. 包含真实 `outputs/screenshots/`、截图索引和最终 PASS/FAIL verdict 的新 immutable validation run。
4. GUI PASS 后的 R16 checkbox 与 evidence bookkeeping 更新。

### Evidence boundary

- run-0033 已提交，必须保持不可变；其 `logs/supervisor-verdict.md` 记录的是 `CLI PASS / GUI PENDING`，不是最终 R16 verdict。
- run-0033 没有 `outputs/`，不能补写为完成的 MIXED run。
- GUI 验证必须通过 `playwright-mcp` 执行。用户手工点击、Playwright/Selenium 脚本或事后补造截图均不构成有效证据。
- 在最终 Supervisor PASS/FAIL 形成前，`tasks.md` 中 16.1 保持 `[ ]`。

## Proposed Completion

### 1. 创建新的 MIXED validation run

由 Supervisor 为 R16 创建下一个单调递增的 run folder：

```text
auto_test_openspec/launch-trae-competition-h5-demo/
run-<NEXT_RUN4>__task-16.1__ref-R16__<YYYYMMDDThhmmssZ>/
```

新目录在执行前必须包含：

- `task.md`
- `run.sh` 与 `run.bat`（GUI/MIXED 规则：仅启动 H5 服务并打印 URL）
- `tests/gui_runbook_judge_journey.md`
- `logs/`
- `outputs/screenshots/`
- 如 CLI 断言产生结构化结果，则包含 `expected/` 与 `outputs/` 中对应的机器可判定文件

不得复制后覆盖 run-0033；新 run 必须自包含并记录其自身的 HEAD、输入、命令和预期。

### 2. 重新执行 CLI 范围

新 MIXED run 应重新执行并记录受影响的 CLI checks，不能仅引用 run-0033 作为本次最终 verdict 的执行结果：

```bash
pnpm --filter @community-map/mobile typecheck
./node_modules/.bin/vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts
pnpm --filter @community-map/mobile build:h5
pnpm --filter @community-map/mobile build:mp-weixin
```

真实命令、exit code 与测试计数写入新 run 的 logs/outputs。

### 3. 通过 MCP 执行 GUI runbook

Supervisor 使用 `playwright-mcp` 执行以下验证并保存截图：

1. 四代表画像分别以 zh/en 完成 welcome→complete。
2. 验证 390px mobile 与 1280px desktop，无横向滚动或关键内容截断。
3. 地图 SDK/key 不可用时，完整两站路线仍可浏览和操作。
4. 地点 detail 404 后标记 unavailable，并正确调整完成分母。
5. zh/en 切换不丢失当前计划。
6. refresh、无状态 deep link 与 Start Over 行为正确。
7. Demo Confirm 明确保持本地，不创建报名、票券或容量变更。
8. welcome→complete 全流程小于 180 秒。

所有截图路径和观察结果写入新 run 的 `logs/gui-screenshot-index.md`。禁止以人工浏览器操作替代 MCP 执行。

### 4. Supervisor 写最终 verdict

仅在新 run 的 CLI 与 GUI 范围都执行完成后，由 Supervisor 写入最终 `logs/supervisor-verdict.md`，明确记录：

- `RESULT: PASS|FAIL`
- 精确命令与 exit codes
- GUI screenshot/index 路径
- 未覆盖边界（如有）

`PENDING` 状态不得命名或描述为最终 verdict。

### 5. PASS 后更新 canonical bookkeeping

只有最终结果为 PASS 时：

1. 将 `openspec/changes/launch-trae-competition-h5-demo/tasks.md` 的 16.1 改为 `[x]`。
2. 将新 run 的 BUNDLE/EVIDENCE 指针追加到 16.1。
3. 在 `docs/competition/trae-evidence-log.md` 追加新 run，保留 run-0033 的 `CLI PASS / GUI PENDING` 历史记录。
4. 运行：

```bash
openspec validate launch-trae-competition-h5-demo --strict --no-interactive
```

若 GUI 或 CLI 为 FAIL，保持 16.1 未完成，并为下一次验证创建另一个新 run；不得覆盖失败证据。

## Assumptions & Decisions

1. R11 仍以 run-0031 为权威 PASS 证据，本计划不修改 R11。
2. run-0033 是历史部分证据，本计划不修改其任何文件。
3. S11 TRAE Session ID 已由用户从 TRAE UI 提供，无需再次填写。
4. R16 的实现提交不回退；当前只修正完成状态和验证流程。
5. R18 部署不在本计划范围内。

## Verification Steps

在本次文档与 bookkeeping 修正后：

```bash
openspec validate launch-trae-competition-h5-demo --strict --no-interactive
git diff --check
git status --short
```

预期：OpenSpec strict validation 通过；R16 为 `[ ]`；run-0033 无修改；文档不再允许手工 GUI 验收，也不再把 `GUI PENDING` 当作最终完成状态。
