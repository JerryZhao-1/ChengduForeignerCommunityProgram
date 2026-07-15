# 桐邻 First 120 Minutes｜社区策展融入路线 — TRAE H5 Demo 证据目录

本目录是 TRAE AI 创造力大赛 H5 版本的证据中枢，记录从基线、设计、实现到发布的全过程。比赛产品本身不调用 AI/LLM；TRAE 是本次实质性版本迭代的开发与证据工具。

## 产品目标

在现有桐梓林社区地图基础上，为新到居民提供可公开访问的移动端 H5：用户完成四个必选单选维度后，获得一条可解释、可导航、可完成的“前 120 分钟”社区融入路线。最终产品继续复用同一套 uni-app 代码构建微信小程序，本次功能验收以 H5 为准。

## 当前比赛版本新增能力

- 无登录访客入口和受限 guest actor。
- 8 个主兴趣、3 个到达阶段、4 个家庭类型、6 个无障碍/环境选择，共 21 个预写双语维度模块，确定性组合为 576 个逻辑场景；不维护 576 份重复全文。
- 每个组合都有稳定 `scenario_key`、双语摘要和四条选择维度解释。
- 1,152 个中英渲染案例由同一版本化社区策展目录覆盖。
- API、mock 和 H5 离线回退使用同一个 shared matcher。
- 一处地点访问、一项 Demo Confirm 和显式完成结果。
- marker-safe 路线列表为基线，H5 地图为可选增强。
- H5 与 mp-weixin 双目标构建回归。

## 诚实边界

- Demo Confirm 不创建真实报名、预约、票券或容量占用。
- 无障碍选择只生成准备和确认建议，不代表地点设施认证。
- Community Plan 不持久化，不提供详情 GET 或服务端完成写入。
- 产品运行时无模型调用、模型密钥或模型结果字段。
- Codex 只可作为补充质量审查；只有真实 TRAE Session ID、截图和 commit 才能作为 TRAE 开发证明。

## 项目基线

| 项                    | 值                                |
| --------------------- | --------------------------------- |
| 原始项目基线 commit   | `238f5c4`                         |
| 无 AI 迁移基线 commit | `da77c4f`                         |
| 比赛分支              | `competition/trae-h5-demo`        |
| OpenSpec change-id    | `launch-trae-competition-h5-demo` |
| 活动 OpenSpec refs    | `R10`–`R18`                       |
| 截止时间              | 2026-07-15 23:59 Asia/Shanghai    |

## 证据结构

- `trae-evidence-log.md`：只记录真实 TRAE Session ID、commit 和截图。
- `submission-draft.md`：提交材料草稿。
- `demo-script.md`：不超过 180 秒的评委流程。
- `design/`：视觉方向、屏幕流和已选方向。
- `evidence/`：原阶段证据及新增 `trae-sessions/S07A`–`S15` 截图目录。
- `auto_test_openspec/launch-trae-competition-h5-demo/`：R10–R18 的不可变机器验证 bundle。
- `trae-ai-free-handoff-prompts.md`：从 S07A 到 S15 的 TRAE 复核、接管、验证、部署和投稿提示词。

## 证据状态

- `implementation complete`：代码或文档任务已经实现。
- `worker bundle prepared`：新的不可变 run folder 已准备脚本、输入、期望值和 runbook。
- `supervisor verified`：实际 outputs/logs、GUI 证据、最终 PASS/FAIL 和证据指针均已写入。

前两种状态不能单独作为发布 PASS。没有真实输出或 Supervisor verdict 的既有 run folder 只代表已准备，不代表已验收。

## 历史与当前事实源

R1–R9 和既有截图记录了 2026-07-15 决策前的探索与实现历史，其中可能出现已被放弃的 DeepSeek/AI 方案。不得修改或删除这些历史证据。当前功能、发布门槛和测试要求只以本仓库的 `launch-trae-competition-h5-demo` OpenSpec change 及 R10–R18 为准。
