# 桐邻 First 120 Minutes｜AI 社区融入路线 — TRAE H5 Demo 证据目录

本目录是 TRAE AI 创造力大赛 H5 版本的证据中枢，记录从基线到提交的全过程。
本阶段仅搭建证据目录骨架，不实现任何比赛功能代码。

## 产品名称

桐邻 First 120 Minutes｜AI 社区融入路线

## 比赛版本目标

在现有桐梓林社区地图 H5 基础上，打造一条面向新到外籍居民的"前 120 分钟社区融入"引导路线 demo。评审版本是可公开访问的移动端 H5，最终产品仍会复用同一套 uni-app 代码发布微信小程序。以 H5 形式呈现可浏览、可参与、可导航的闭环体验，用于 TRAE AI 创造力大赛提交。

## 原项目已有能力

- `apps/mobile` H5 前台：home / events / discover / places / more 五大页面组
- events：活动列表、活动详情、报名、票券状态
- discover：帖子列表、详情、发帖、搜索、举报
- places：地点列表、地图 marker、详情、推荐、导航
- more：个人主页、通知、我的帖子/评论/收藏/点赞/报名/举报、关注、登录、语言设置
- `packages/shared`：完整 contracts（announcements/auth/discover/events/files/notifications/places/paths）、schemas、enums、mock service / mock client
- `apps/mobile/src/i18n/catalog.ts`：中英双语 catalog（zh / en 双键结构）
- `apps/api`：统一 BFF，支持 mock 与 CloudBase provider

## 本次比赛新增能力（计划）

- "First 120 Minutes"融入路线引导层与步骤化动线
- 面向外籍居民的中英双语首屏体验优化
- 比赛专用 demo 入口与演示脚本
- 证据链：从基线到发布的 11 阶段可追溯记录

## 基线信息

| 项 | 值 |
|----|----|
| 基线 commit | `238f5c4` |
| 基线分支 | `feat/discover-integration` |
| 比赛分支 | `competition/trae-h5-demo` |
| OpenSpec change-id | `launch-trae-competition-h5-demo` |
| 截止时间 | 2026-07-15 23:59 Asia/Shanghai |

## 目录结构

- `README.md`：本文件
- `trae-evidence-log.md`：证据日志（11 阶段逐行记录）
- `submission-draft.md`：提交材料草稿
- `demo-script.md`：演示脚本
- `design/`：设计文档（DESIGN / screen-flow / selected-direction）
- `evidence/`：11 个阶段证据子目录

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

## evidence 阶段说明

| 编号 | 目录 | 阶段含义 |
|------|------|----------|
| 01 | baseline | 基线确认：分支、commit、现有能力盘点 |
| 02 | design | 设计方向：选定 demo 叙事与屏幕流转 |
| 03 | openspec | OpenSpec change proposal 创建与校验 |
| 04 | contracts | 数据契约：复用 shared contracts，定义 demo 数据子集 |
| 05 | onboarding | 首屏融入路线引导页实现 |
| 06 | planner | 融入路线步骤规划器 |
| 07 | map | 地图与地点导航动线 |
| 08 | registration | 活动报名与参与动线 |
| 09 | resilience | 错误态 / 空状态 / 加载态韧性 |
| 10 | qa | QA 验证与 MCP 浏览器验证 |
| 11 | release | 最终验证、回归、证据归档 |

## 本阶段约束

- 仅搭建证据目录骨架，不修改任何业务源码（`apps/`、`packages/`、`openspec/specs/`）
- 仅新增 `docs/competition/` 下的文档与占位文件
- 后续比赛功能实现将在独立阶段进行，并同步更新证据日志
