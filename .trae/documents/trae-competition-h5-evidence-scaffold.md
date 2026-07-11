# 桐邻 First 120 Minutes — TRAE 比赛 H5 证据目录搭建计划

## Summary

本阶段目标是搭建 TRAE AI 创造力大赛 H5 版本的证据目录骨架，不实现任何比赛功能代码。工作区已确认干净（分支 `feat/discover-integration`，HEAD `238f5c4`），将从 HEAD 创建 `competition/trae-h5-demo` 分支，在 `docs/competition/` 下创建完整的证据目录结构、`trae-evidence-log.md` 模板和 `README.md` 基线文档。不修改任何业务源码（`apps/`、`packages/`、`openspec/specs/`）。

## Current State Analysis

### Git 状态

- 当前分支：`feat/discover-integration`
- HEAD commit：`238f5c4`（"Refine community map data flows and UI behavior"）
- 工作区状态：干净（nothing to commit, working tree clean）
- `competition/trae-h5-demo` 分支：不存在（可安全创建）

### 现有 OpenSpec changes

活跃 changes 共 7 个（complete-discover-core-content-loop、connect-discover-to-community-modules、harden-discover-governance-console、launch-discover-social-ops、production-public-launch-closure、production-readiness-acceptance、wechat-miniapp-auth-publish-share-hardening），均与 discover / 生产就绪 / 小程序认证相关。`launch-trae-competition-h5-demo` 不存在。

### 现有项目能力（写入 README 用）

- `apps/mobile/src/pages/`：home、events（列表/详情/报名）、discover（列表/详情/发帖/搜索/举报）、places（列表/地图/详情/推荐/导航）、more（个人主页/通知/我的帖子/评论/收藏/点赞/报名/举报/关注/登录/语言设置）
- `packages/shared/src/`：完整 contracts（announcements/auth/discover/events/files/notifications/places/paths）、schemas、enums、mock service/client
- `apps/mobile/src/i18n/catalog.ts`：中英双语 catalog（zh/en 双键结构）
- `apps/api`：统一 BFF，支持 mock 与 CloudBase provider

### 不存在的内容

- `docs/competition/`：不存在
- `openspec/changes/launch-trae-competition-h5-demo/`：不存在
- 仓库中无任何 competition / trae-h5 相关文件

## Proposed Changes

### 步骤 1：创建比赛分支

从当前 HEAD `238f5c4` 创建并切换到 `competition/trae-h5-demo` 分支。

```bash
git checkout -b competition/trae-h5-demo
```

### 步骤 2：创建目录结构

创建以下目录树（Git 不跟踪空目录，每个 evidence 子目录放置一个 `.gitkeep` 或 `README.md`）：

```
docs/competition/
├── README.md
├── trae-evidence-log.md
├── submission-draft.md
├── demo-script.md
├── design/
│   ├── DESIGN.md
│   ├── screen-flow.md
│   └── selected-direction.md
└── evidence/
    ├── 01-baseline/
    ├── 02-design/
    ├── 03-openspec/
    ├── 04-contracts/
    ├── 05-onboarding/
    ├── 06-planner/
    ├── 07-map/
    ├── 08-registration/
    ├── 09-resilience/
    ├── 10-qa/
    └── 11-release/
```

创建命令：

```bash
mkdir -p docs/competition/design
mkdir -p docs/competition/evidence/{01-baseline,02-design,03-openspec,04-contracts,05-onboarding,06-planner,07-map,08-registration,09-resilience,10-qa,11-release}
```

### 步骤 3：写入 `docs/competition/README.md`

记录以下必填字段：

| 字段 | 值 |
|------|----|
| 产品名称 | 桐邻 First 120 Minutes｜AI 社区融入路线 |
| 比赛版本目标 | 可公开访问的移动端 H5，复用同一套 uni-app 代码发布微信小程序；面向新到外籍居民的"前 120 分钟社区融入"引导路线 |
| 原项目已有能力 | home/events/discover/places/more 五大页面组；shared contracts/schemas/enums/mock；中英双语 i18n catalog；apps/api 统一 BFF |
| 本次比赛新增能力（计划） | "First 120 Minutes"融入路线引导层；面向外籍居民的首屏体验优化；比赛专用 demo 入口与演示脚本；11 阶段证据链 |
| 基线 commit | `238f5c4` |
| 分支名 | `competition/trae-h5-demo` |
| OpenSpec change-id | `launch-trae-competition-h5-demo` |
| 截止时间 | 2026-07-15 23:59 Asia/Shanghai |

同时记录目录结构说明和本阶段约束（仅搭建证据骨架，不修改业务源码）。

### 步骤 4：写入 `docs/competition/trae-evidence-log.md`

使用用户指定模板，9 列表格 + 1 个示例行 + 11 个阶段占位行：

| ID | Date | TRAE Surface | Session ID | Objective | Main Files | Commit | Screenshot | Result |
|----|------|--------------|------------|-----------|------------|--------|------------|--------|

示例行（用户指定格式）：
```
| S01 | 2026-07-11 | TRAE Design | <full-session-id> | Visual exploration | docs/competition/design/* | <commit> | evidence/02-design/...png | Selected |
```

11 个阶段占位行（对应 evidence 子目录）：
- 01-baseline：确认基线 commit/分支/现有能力
- 02-design：选定 demo 叙事方向与屏幕流转
- 03-openspec：OpenSpec change proposal 创建与校验
- 04-contracts：确认复用 shared contracts 与 demo 数据子集
- 05-onboarding：首屏融入路线引导页实现
- 06-planner：融入路线步骤规划器
- 07-map：地图与地点导航动线
- 08-registration：活动报名与参与动线
- 09-resilience：错误态/空状态/加载态韧性
- 10-qa：QA 验证与 MCP 浏览器验证
- 11-release：最终验证、回归、证据归档

### 步骤 5：写入骨架文档

以下文件创建为骨架占位，包含标题、阶段目标和"待后续阶段填充"标注，不含具体实现内容：

1. `docs/competition/submission-draft.md`：提交材料草稿骨架（作品名称、一句话简介、目标用户、核心场景、技术栈、待定项 checklist）
2. `docs/competition/demo-script.md`：演示脚本骨架（演示环境、动线步骤、讲解要点、待 09-demo-prep 阶段细化）
3. `docs/competition/design/DESIGN.md`：设计总纲骨架（设计目标、原则、复用现有能力清单、新增设计元素计划、非目标）
4. `docs/competition/design/screen-flow.md`：屏幕流转骨架（主流转 ASCII 图、屏幕清单表、待 03-openspec 阶段细化）
5. `docs/competition/design/selected-direction.md`：选定方向骨架（候选方向 A/B/C 对比、选定结论与理由）

### 步骤 6：为 11 个 evidence 子目录各创建 `README.md`

每个子目录的 `README.md` 统一结构：阶段编号、阶段目标、预期产物、状态 checklist（全部未勾选）。确保 Git 跟踪这些目录。

### 步骤 7：验证

```bash
# 确认分支
git branch --show-current
# 确认只含 docs/competition/ 变化
git diff feat/discover-integration...HEAD --stat
# 确认工作区干净（提交后）
git status
```

验证标准：
- `git branch --show-current` 输出 `competition/trae-h5-demo`
- `git diff --stat` 只含 `docs/competition/` 路径
- 不含任何 `apps/`、`packages/`、`openspec/specs/` 文件变化
- `docs/competition/trae-evidence-log.md` 表格含 9 列 + 示例行 + 11 阶段行
- `docs/competition/evidence/` 下有 11 个子目录，各含 README.md

### 步骤 8：提交

```bash
git add docs/competition/
git commit -m "Add TRAE competition H5 demo evidence scaffold (no feature implementation)"
```

## Assumptions & Decisions

### 决策 1：本阶段不创建 OpenSpec change 目录

用户指定 OpenSpec change-id 为 `launch-trae-competition-h5-demo`，但本阶段仅搭建证据目录骨架。`openspec/changes/launch-trae-competition-h5-demo/` 的 proposal/design/tasks 将在后续 03-openspec 阶段创建，避免本阶段 tasks.md 因缺少合规任务行而无法通过 `openspec validate --strict`。change-id 已记录在 `docs/competition/README.md` 中作为计划标识。

### 决策 2：evidence 子目录使用用户指定名称

证据子目录使用用户指定的 `01-baseline` 到 `11-release` 命名（03-openspec、04-contracts、05-onboarding、06-planner、07-map、08-registration、09-resilience、10-qa），对应比赛 H5 demo 的交付链阶段。

### 决策 3：骨架文档不含具体实现内容

`submission-draft.md`、`demo-script.md`、`design/*.md` 创建为骨架占位，仅含结构框架和"待后续阶段填充"标注，不提前实现比赛功能或设计决策细节。

### 假设

- `competition/trae-h5-demo` 分支名在本地和远程均不存在（已通过 `git branch` 确认本地不存在）
- 用户要求的"不修改业务源码"不包括 `docs/competition/` 下的新增文档
- 当前 Session ID 在执行阶段可从环境获取，trae-evidence-log.md 示例行中保留 `<full-session-id>` 占位

## Verification Steps

1. **分支验证**：`git branch --show-current` 输出 `competition/trae-h5-demo`
2. **基线验证**：`git log --oneline -2` 显示新提交在 `238f5c4` 之上
3. **变更范围验证**：`git diff feat/discover-integration...HEAD --stat` 只含 `docs/competition/` 路径
4. **目录结构验证**：`ls docs/competition/` 含 README.md、trae-evidence-log.md、submission-draft.md、demo-script.md、design/、evidence/
5. **evidence 子目录验证**：`ls docs/competition/evidence/` 含 01-baseline 到 11-release 共 11 个子目录，各含 README.md
6. **证据日志验证**：`trae-evidence-log.md` 表格含 9 列（ID/Date/TRAE Surface/Session ID/Objective/Main Files/Commit/Screenshot/Result）+ 示例行 + 11 阶段行
7. **业务源码未修改验证**：`git diff feat/discover-integration...HEAD -- apps/ packages/ openspec/specs/` 无输出
8. **工作区干净验证**：提交后 `git status` 显示 nothing to commit

## 阶段产出报告要求

完成本阶段后输出（不开始下一阶段）：
1. 本阶段简明总结
2. 修改文件清单
3. 运行命令及结果
4. 推荐保存的截图画面（基线 git status、分支创建、目录结构、git diff --stat）
5. 当前 Session 最值得记录的 1-2 个关键决策
6. 建议 commit message
