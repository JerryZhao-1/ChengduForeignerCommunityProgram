# Plan: 执行 R11 + R15 验证 run folder 与最终 8 点报告（continuation）

## Summary

本 Session 是 `competition/trae-h5-demo` 分支上"桐邻 First 120 Minutes｜社区策展融入路线" R11 + R15 复核任务的**继续执行**。前一个 Session 已完成：

- **Change 1**（R11 shared contract 测试补充）：`packages/shared/test/community-plans.spec.ts` 已修改（5 字段逐缺失、单选字段拒数组、mock client surface 只暴露 generate）。✅ 已完成
- **Change 2**（R15 mobile adapter parity/错误分支测试补充）：`apps/mobile/src/api/community-plan-adapter.spec.ts` 已修改（online/offline fingerprint 一致但 deliveryMode 不同、DNS/timeout transport 错误 fallback）。✅ 已完成
- **Change 3**（R11 run folder run-0027 文件骨架）：`task.md`、`run.sh`、`run.bat`、`tests/verify-vitest.mjs`、`expected/result.json` 已创建。⚠️ **未执行 run.sh，缺 logs/ 与 outputs/ 与 supervisor-verdict.md**

本 continuation plan 只做剩余的执行与证据生成工作，**不改任何生产代码、不改已修改的 2 个测试文件、不改 run-0027 已有文件**。完成后输出 8 点报告，**不进入 R16+**。

参考原 plan：[community-plan-contracts-and-parity-review.md](file:///Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/.trae/documents/community-plan-contracts-and-parity-review.md)

## Current State Analysis（Phase 1 探索结论）

### Git 状态
- Branch: `competition/trae-h5-demo`
- HEAD: `e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`（short `e15efde4`）
- 已修改未提交：`apps/mobile/src/api/community-plan-adapter.spec.ts`、`packages/shared/test/community-plans.spec.ts`
- 已新增未跟踪：`.trae/documents/community-plan-contracts-and-parity-review.md`、`auto_test_openspec/launch-trae-competition-h5-demo/run-0027__task-11.1__ref-R11__20260715T121731Z/`
- run-0028 不存在

### run-0027 现状
- 目录：`auto_test_openspec/launch-trae-competition-h5-demo/run-0027__task-11.1__ref-R11__20260715T121731Z/`
- 已有：`task.md`、`run.sh`、`run.bat`、`tests/verify-vitest.mjs`、`expected/result.json`
- 缺失：`logs/run.log`、`logs/vitest.json`、`outputs/result.json`、`supervisor-verdict.md`
- verifier 逻辑：运行 `pnpm --filter @community-map/shared typecheck` + `eslint packages/shared/test/community-plans.spec.ts` + `vitest run` 4 个 focused spec（community-plans / community-plan-engine / contracts / client），写 logs + outputs/result.json，含 contractAssertions 摘要

### run-0028 需要新建（R15）
- 参照 run-0014（R15 模板，有 expected/parity-summary.json + tests/verify-vitest.mjs）+ run-0023/0025（comprehensive verifier 模式 + supervisor-verdict.md）
- verifier 应运行：`pnpm --filter @community-map/mobile typecheck` + `vitest run` mobile adapter spec + onboarding-store spec + shared community-plan-engine.spec.ts（parity 源）
- expected/parity-summary.json 应记录 576/576 parity

### 测试现状（前 Session 已验证）
- shared focused tests: 75/75 PASS
- mobile adapter + store tests: 22/22 PASS
- 两个 typecheck 均 exit 0

## Proposed Changes

### Change A — 执行 run-0027/run.sh 并写 supervisor-verdict.md（R11 证据生成）

**不创建/修改任何源文件**，只生成证据产物：

1. 执行 `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0027__task-11.1__ref-R11__20260715T121731Z/run.sh`
   - verifier 会自动创建 `logs/run.log`、`logs/vitest.json`、`outputs/result.json`
   - 期望退出码 0，result.json `finalDecision: "pass"`
2. 读 `outputs/result.json` 确认 PASS + 真实 test 计数
3. 写 `run-0027/supervisor-verdict.md`（参照 run-0025 verdict 格式）：Decision PASS、HEAD `e15efde4`、证据指针、verified 条目、boundary（不含 GUI / R18 / TRAE Session）

### Change B — 新建 run-0028 R15 validation run folder

**目录**：`auto_test_openspec/launch-trae-competition-h5-demo/run-0028__task-15.1__ref-R15__<当前UTC时间>Z/`

创建以下文件（参照 run-0027 结构 + run-0014 的 parity-summary）：

- `task.md`：run#0028、task 15.1、ref R15、SCOPE: CLI、HEAD `e15efde4`、运行说明、输入/输出/期望、acceptance criteria（576/576 parity、全错误分支、offline 完成路线、deliveryMode 仅在 state、bundle 无密钥）、boundary（不含 GUI/R18/TRAE Session）
- `run.sh`：bash，resolve repo root，invoke `node tests/verify-vitest.mjs`
- `run.bat`：Windows 等价（参照 run-0027/run.bat）
- `tests/verify-vitest.mjs`：执行 `pnpm --filter @community-map/mobile typecheck` + `eslint apps/mobile/src/api/community-plan-adapter.spec.ts` + `vitest run` 3 个 focused spec（community-plan-adapter / onboarding-store / community-plan-engine），写 logs/run.log + logs/vitest.json + outputs/result.json + outputs/parity-summary.json，含 parityAssertions 摘要
- `expected/parity-summary.json`：`{ providerLocalParity: "576/576", totalScenarios: 576, mismatchedFingerprints: 0, deliveryModeInsidePlan: false, fourXStaysApiError: true }`
- `expected/result.json`：期望 typecheck exit 0、tests 全 PASS

### Change C — 执行 run-0028/run.sh 并写 supervisor-verdict.md（R15 证据生成）

1. 执行 `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0028__task-15.1__ref-R15__<UTC>Z/run.sh`
2. 读 `outputs/result.json` + `outputs/parity-summary.json` 确认 PASS + 576/576
3. 写 `run-0028/supervisor-verdict.md`：Decision PASS、HEAD `e15efde4`、证据指针、verified 条目（576/576 parity、DNS/timeout fallback、4xx 不切离线、offline 完成 visit+confirm+finish、bundle 无密钥）、boundary

### Change D — openspec validate + 最终核对

1. `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` → 期望 exit 0
2. `git status` 确认未修改 run-0001..run-0026 及任何历史截图/R1–R9 证据
3. 输出 8 点报告

## Assumptions & Decisions

- **Assumption**：run-0027 已有文件（task.md/run.sh/verify-vitest.mjs/expected）经前 Session 审查正确，本 Session 不重写，只执行 + 补 verdict。
- **Assumption**：run-0028 的 verifier 逻辑与 run-0027 对称，仅 target 包不同（mobile vs shared）+ 多写 parity-summary.json。
- **Decision**：run-0028 时间戳用执行时的真实 UTC 时间（`date -u +%Y%m%dT%H%M%SZ`），不沿用 run-0027 的时间戳。
- **Decision**：不提交 git commit（AGENTS.md 安全协议）。报告中给出建议 commit message；是否提交由用户决定。
- **Decision**：TRAE Session ID 由用户从 TRAE UI 复制，本 Session 不虚构。
- **Decision**：R11/R15 为 CLI scope，无 GUI 截图；报告"推荐截图"项标注 N/A 并说明原因。
- **Decision**：若执行中发现真实 test/typecheck 失败，立即停下报告，不擅自改生产代码或测试。

## Verification Steps

1. `bash run-0027/run.sh` → exit 0，`outputs/result.json` finalDecision=pass
2. 写 `run-0027/supervisor-verdict.md`
3. 创建 run-0028 全部文件
4. `bash run-0028/run.sh` → exit 0，`outputs/result.json` finalDecision=pass，`outputs/parity-summary.json` 576/576
5. 写 `run-0028/supervisor-verdict.md`
6. `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` → exit 0
7. `git status` 确认历史 run folder 未被触碰
8. 输出 8 点报告

## 完成后输出（8 点报告）

1. 复核范围和发现
2. 修改文件（仅 2 个测试文件 + 2 个新 run folder + 2 个 supervisor-verdict）
3. 运行命令及真实结果
4. 新建 validation run folder（run-0027、run-0028）
5. 推荐保存的 TRAE 原始截图和产品截图（CLI scope → N/A，说明原因）
6. 当前完整 Session ID 的记录提醒（用户需从 TRAE UI 复制）
7. 建议 commit message（两条）
8. 未完成项和风险
