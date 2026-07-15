# 比赛提交材料草稿

## 作品名称

桐邻 First 120 Minutes｜社区策展融入路线

## 一句话简介

面向成都桐梓林新居民的双语 H5：用四个单选问题匹配一条可立即执行的 120 分钟社区路线，并解释每个选择为什么影响结果。

## 产品价值

- 新居民不需要登录、微信授权、验证码或测试资格，30 秒内进入核心体验。
- 8 个首要兴趣、3 个到达阶段、4 个家庭结构和 6 个参与需求组成 576 个稳定场景。
- 每个场景有唯一 `scenario_key`、完整中英摘要和固定四维理由。
- 路线固定包含一个地点和一个策展活动，总时长 120 分钟。
- API 与断网 H5 使用 `tongzilin-curated-v1` 同一安全目录与 shared matcher；断网只改变提示，不改变内容。

## 真实边界

- 产品本身不调用 AI/LLM；TRAE 是本次实质迭代的开发工具。
- Demo Confirm 仅修改当前浏览器内存状态，不创建报名、预约、票券或名额占用。
- 无障碍/环境反馈只给出出发前确认建议，不代表地点设施认证。
- 不持久化偏好或计划，不采集 PII。

## 本次实质迭代

- 将旧多选画像迁移为五字段严格单选契约。
- 新增版本化双语社区策展目录和 576 组合确定性匹配器。
- 新增“为什么这样匹配”的四维可解释方案界面。
- 新增 HTTP 5xx/transport/timeout 的本地同版本匹配容灾。
- 保留地点到访、活动演示确认和完成页闭环。
- 同一套 uni-app 代码继续兼容 H5 与微信小程序构建。

## 技术栈

- uni-app + Vue 3 + Vite
- TypeScript + Zod
- Koa API / CloudBase 目标部署
- `packages/shared` 共享 schema、contract、策展目录和 matcher
- Vitest 穷举与跨路径一致性验证

## 提交入口

- 立即体验 H5：`PENDING_PUBLIC_URL`
- 备用离线 Demo：`PENDING_OFFLINE_ZIP`
- 2–3 分钟演示视频：`PENDING_VIDEO_URL`
- 可选微信小程序截图/体验版说明：`PENDING`

## 仓库与证据

- 比赛分支：`competition/trae-h5-demo`
- 无 AI 迁移基线：`da77c4f`
- TRAE Session 证据索引：`docs/competition/trae-evidence-log.md`
- OpenSpec：`openspec/changes/launch-trae-competition-h5-demo`
- 当前发布门槛：R10–R18；历史 R1–R9 已被 2026-07-15 决策取代。

## 发布前待补

- [ ] 公开 H5 URL、build ID、最终 commit
- [ ] 离线 ZIP 与视频 URL
- [ ] S07A–S15 真实 TRAE Session ID、截图和对应 commit
- [ ] 外部中文、英文、离线三条流程记录
- [ ] Admin Static Hosting 部署前后不变证据
