# TRAE Competition Evidence Log

本表记录 TRAE AI 创造力大赛 H5 demo 从基线到发布的全过程证据。每完成一个阶段，填写对应行；截图与产物存放于 `evidence/<阶段>/`。

| ID | Date | TRAE Surface | Session ID | Objective | Main Files | Commit | Screenshot | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | 2026-07-11 | TRAE Design | <full-session-id> | Visual exploration | docs/competition/design/* | <commit> | evidence/02-design/...png | Selected |
| 01-baseline | 2026-07-11 | TRAE Builder | <full-session-id> | 确认基线 commit/分支/现有能力，搭建证据目录 | docs/competition/README.md, docs/competition/trae-evidence-log.md | <commit> | evidence/01-baseline/...png | Done |
| 02-design | | | | 选定 demo 叙事方向与屏幕流转 | design/selected-direction.md, design/screen-flow.md | | | |
| 03-openspec | | | | OpenSpec change proposal 创建与校验 | openspec/changes/launch-trae-competition-h5-demo/* | | | |
| 04-contracts | | | | 确认复用 shared contracts 与 demo 数据子集 | packages/shared/src/contracts/* | | | |
| 05-onboarding | | | | 首屏融入路线引导页实现 | apps/mobile/src/pages/home/* | | | |
| 06-planner | | | | 融入路线步骤规划器 | | | | |
| 07-map | | | | 地图与地点导航动线 | apps/mobile/src/pages/places/* | | | |
| 08-registration | | | | 活动报名与参与动线 | apps/mobile/src/pages/events/* | | | |
| 09-resilience | | | | 错误态/空状态/加载态韧性 | | | | |
| 10-qa | | | | QA 验证与 MCP 浏览器验证 | | | | |
| 11-release | | | | 最终验证、回归、证据归档 | trae-evidence-log.md | | | |

## 字段说明

- **ID**：阶段编号，对应 `evidence/` 子目录
- **Date**：完成日期（YYYY-MM-DD）
- **TRAE Surface**：使用的 TRAE 能力面（如 TRAE Builder / TRAE Chat / TRAE Agent / TRAE Design）
- **Session ID**：TRAE 会话标识
- **Objective**：该阶段目标
- **Main Files**：主要产出/涉及文件
- **Commit**：关联 commit hash
- **Screenshot**：截图路径（相对 `evidence/` 目录）
- **Result**：该阶段结果（Done / Selected / PASS / BLOCKED / IN-PROGRESS）
