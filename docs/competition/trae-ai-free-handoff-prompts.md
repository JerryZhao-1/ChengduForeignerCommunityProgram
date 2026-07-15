# TRAE 无 AI 策展路线接管提示词（S07A–S15）

本手册从当前 `competition/trae-h5-demo` 实现继续，不从历史基线重做。产品运行时不调用 AI/LLM；TRAE 是比赛开发与证据工具。历史 R1–R9、旧 AI 截图和既有 validation run folder 只作不可变历史证据。

## 公共前缀

每个 Session 先粘贴以下内容，再追加对应阶段提示词：

```text
你正在接管 competition/trae-h5-demo 分支上的“桐邻 First 120 Minutes｜社区策展融入路线”。

开始前完整阅读：
1. AGENTS.md
2. README.md
3. openspec/project.md
4. docs/ui-guidelines.md
5. docs/competition 下全部当前文档
6. openspec/changes/launch-trae-competition-h5-demo 下全部 artifacts
7. 与本阶段相关的 shared、API、mobile 源码和测试
8. 当前 git log、git status 和已有 auto_test_openspec 证据

重要背景：
- 当前 branch 已有一套无 AI 的确定性实现，不要从旧方案盲目重写。
- 比赛产品运行时不得调用 AI/LLM。
- 576 个场景由 21 个预写双语维度模块组合，不维护 576 份重复全文。
- 历史 R1–R9 和旧 AI 截图只作为 superseded evidence，禁止修改。
- 优先复核现有实现，只做必要修正，不做无关重构。
- 跨端 schema、type、contract、matcher 和 catalog 放在 packages/shared。
- GUI 验证使用 MCP runbook，不新增 Playwright/Selenium 脚本。
- 不使用 any、as any、@ts-ignore 或 @ts-nocheck。
- 不虚构 TRAE Session ID、测试结果、截图、公开 URL 或部署状态。

完成本 Session 后停止，不进入下一阶段，并输出：
1. 复核范围和发现
2. 修改文件
3. 运行命令及真实结果
4. 新建 validation run folder
5. 推荐保存的 TRAE 原始截图和产品截图
6. 当前完整 Session ID 的记录提醒
7. 建议 commit message
8. 未完成项和风险
```

## S07A：无 AI OpenSpec 复核与规格收口

```text
复核并收口 launch-trae-competition-h5-demo 的当前 OpenSpec。

必须确认 proposal、design、tasks 和四份 capability spec 一致表达：
- 产品运行时无 AI/LLM。
- 8×3×4×6=576 个逻辑组合，语言产生 1,152 个渲染案例。
- 使用 21 个预写双语维度模块确定性组合反馈。
- 每个结果有稳定 scenario_key、catalog_version、双语摘要和固定顺序四条理由。
- API、mock、离线 H5 使用同一 matcher。
- Demo Confirm 不是真实报名。
- 无障碍反馈不构成设施认证。
- 历史 AI 内容只作为 superseded evidence。
- implementation complete、worker bundle prepared、supervisor verified 是三种不同状态。

检查 tasks 的引用唯一性、ACCEPT/TEST、证据目录规则和 R18 发布门禁。
运行 strict OpenSpec validation 和当前文档 stale-claim 扫描。
只在发现不一致时修改，不重写已经正确的规格。
```

建议 commit：`docs(openspec): finalize AI-free curated route specification`

## S07B：严格单选契约复核

```text
复核 Community Plan shared schemas、types、contracts、paths 和 clients。

确认：
- 请求只接受五个严格字段。
- 兴趣和参与需求均为必选单选。
- 拒绝旧 arrays、community_id、PII、自由文本和未知字段。
- 响应要求 scenario_key、catalog_version、四条有序理由和严格两站路线。
- 响应中不存在 generated_by、ai_status、usage、model 或 prompt 字段。
- 只暴露 POST /community-plan/generate。
- 地点和活动投影不泄露详情、管理、容量、联系方式和审核字段。

补充或修正有效/无效 contract tests，运行 shared typecheck 和 focused tests。
```

建议 commit：`refactor(shared): lock deterministic community plan contracts`

## S07C：576 组合策展目录与 matcher 复核

```text
复核 packages/shared 中的策展目录、matcher、fixtures 和穷举测试。

要求：
- catalog version 固定为 tongzilin-curated-v1。
- 8 个兴趣、3 个到达阶段、4 个家庭类型、6 个参与需求，共 21 个模块，全部有非空 zh/en 文案。
- 任一组合生成稳定 scenario_key、摘要和四条选择理由。
- 每条理由必须等于对应用户选项的预写模块，不能只验证 key 数量。
- 地点选择使用稳定排序，分数相同时按 _id。
- 时间、随机数、对象插入顺序和显示语言不得改变语义结果。
- accessibility_need 只改变解释和准备提示，不声明未验证设施。
- 缺少策展地点或固定活动时明确失败，不伪造路线。
- provider/local 可共享同一安全 bundle。

测试必须证明：21 modules、576 scenarios、576 unique keys、1,152 localized cases、0 invalid plans、0 missing copy、0 reason/module mismatch。
输出机器可读 coverage summary。
```

建议 commit：`feat(shared): verify curated feedback for all resident profiles`

## S08：无模型 API、guest 安全与隐私

```text
复核 Community Plan API route、provider types、mock provider、CloudBase provider 和 deploy fallback。

要求：
- 所有 provider 调用 shared matcher，不访问任何模型服务。
- guest judge 才能生成计划；其他身份调用 generation 返回 403。
- guest 除 generation 和 public reads 外的 mutation 全部拒绝。
- 保留 spoof-resistant 10/60s 限流、过期清理和 bucket 上限。
- 严格 Zod 输入、统一成功/错误 envelope。
- 日志只包含 requestId、actor kind、固定 community、catalog_version、duration、timestamp；不得记录会编码完整偏好的 scenario_key。
- 不记录完整偏好、accessibility_need、解释文案、实体详情或请求体。
- CORS 只增加必要的 x-guest-mode 支持。
- 不破坏 Places list/map/detail 字段边界。

运行 API typecheck、guest authorization、limiter、日志、576 provider profile 和缺失目录测试。
```

建议 commit：`refactor(api): use deterministic community plan matcher`

## S09：单选 onboarding 与解释型 UI

```text
复核并完善 H5 onboarding 和 plan 页面。

要求：
- 四步流程收集语言、兴趣、到达阶段、家庭类型和参与需求。
- 兴趣和参与需求是 keyboard-operable 单选；后选覆盖前选。
- none 显示“无额外需求 / No additional need”。
- 生成状态使用核对时间、匹配地点、整理提示、准备路线等透明文案。
- 方案页显示“为什么这样匹配”、双语摘要和固定四条理由。
- 不显示 AI、模型、generated_by 或 provider status。
- 离线状态只显示“使用同版本本地社区目录”。
- 全部系统文案来自中央 zh/en catalog，不显示 raw enum。
- 390px 和桌面均可用，触控目标至少 44px，焦点可见。
- mp-weixin 只显示本地化 H5-only 边界，不暴露比赛入口。

运行 store、adapter、i18n 测试和 mobile typecheck，并按 MCP runbook 验证中英文。
```

建议 commit：`feat(mobile): explain deterministic community plan matches`

## S10：在线/离线语义一致性

```text
复核 Community Plan adapter、mock mode 和离线 bundle。

要求：
- online 成功返回 API 结果。
- mock、transport、DNS、timeout 和 5xx 使用当前偏好调用 shared matcher。
- 400/403/404/409/429 保持本地化错误，不切换离线。
- deliveryMode 只存在于 mobile state，不进入 CommunityPlan。
- 在线与离线同一偏好的 scenario_key、catalog_version、refs、explanation、summaries、tips 完全一致。
- requestId 和 generated_at 可不参与语义 fingerprint。
- 断网后仍能访问地点、Demo Confirm 并完成路线。
- 不把生产密钥或服务端配置打入 bundle。

穷举验证 provider/local parity 576/576，并覆盖所有错误分支。
```

建议 commit：`test(mobile): prove online and offline plan parity`

## S11：评委旅程与视觉收口

```text
只精修比赛主旅程，不增加新功能。

验证和修正：
- welcome 到 complete 可在 180 秒内完成。
- route list 在地图 SDK/key 缺失时仍完整可操作。
- 地点访问、Demo Confirm、Finish Route 状态正确。
- 地点 detail 404 会标记 unavailable 并调整完成分母。
- 切换中英文不丢失当前计划。
- refresh、无状态 deep link、Start Over 行为明确。
- Demo Confirm 附近明确说明不创建报名、预约、票券或名额。
- 遵循 DESIGN.md 的 field-guide 视觉体系。
- 390px 无横向滚动，桌面最大宽度合理，按钮和键盘焦点合格。
- 不引入新 UI 库，不加入 AI 科技风、emoji 图标或无意义动画。

使用 MCP 分别验证四个代表画像、两种语言、移动/桌面、地图降级和完整闭环。
```

建议 commit：`style(mobile): polish curated route judge journey`

## S12：完整 QA 与真实证据

```text
不要增加新功能。执行完整本地发布门禁。

依次运行：
1. openspec validate launch-trae-competition-h5-demo --strict --no-interactive
2. pnpm --filter @community-map/shared typecheck
3. pnpm --filter @community-map/api typecheck
4. pnpm --filter @community-map/mobile typecheck
5. pnpm typecheck
6. pnpm test
7. pnpm lint
8. pnpm --filter @community-map/mobile build:h5
9. pnpm --filter @community-map/mobile build:mp-weixin

另外检查：
- 21/21 双语维度模块
- 576/576 场景覆盖
- 1,152/1,152 本地化覆盖
- 576/576 provider/local parity
- 0 reason/module mismatch
- 构建产物没有 Community Plan 模型 endpoint、credential 或结果字段
- 无新增类型逃逸
- GUI 无 console error、横向滚动、raw enum 或 AI 生成文案

为每项创建全新的不可变 run folder，真实写入 outputs、logs 和截图索引。
Worker 不得自行宣告 PASS；由 Supervisor 执行后写最终 verdict。
```

建议 commit：`test: validate AI-free competition release candidate`

## S13：独立 Review findings 闭环

```text
读取独立 reviewer 对当前 release candidate 的 findings。

逐项执行：
1. 复现
2. 判断 Accepted / Rejected / Deferred
3. Accepted 项做最小修复
4. 添加回归测试
5. 运行受影响 typecheck/test/build
6. 创建新的不可变验证 run
7. 不修改无关代码

重点关注：请求契约和 UI 状态错配、完整反馈覆盖、online/offline drift、guest 越权、日志隐私、误导报名或无障碍声明、双目标条件编译、刷新/深链/地图降级，以及证据目录缺实际 outputs 或 Supervisor verdict。

任何 P0 未解决前不得标记 release ready。

<Codex findings>
```

建议 commit：`fix: close competition release review findings`

## S14：独立部署与外部验收

```text
不增加功能。完成 R18 独立部署和公开验收。

部署前：
- 确认 R10–R17 有真实 Supervisor 证据。
- 记录当前 commit、API URL 和 Admin Static Hosting 响应。
- 检查所有 VITE_ 变量不含服务端 secret。
- 使用 production API 配置构建 H5。
- 确认目标是独立 CloudBase Web App trae-h5-demo，不覆盖现有 Admin hosting。

部署后：
- 记录平台返回的真实公开 URL、build/version ID、时间、commit 和 rollback 操作。
- 外部完成中文在线、英文在线、阻断 API 离线三条流程，每条控制在 180 秒内。
- 在线流程不得显示离线 badge；离线流程必须显示同版本目录 badge。
- 比较同一画像的 scenario/catalog/refs/四条解释。
- 验证深链、刷新、移动/桌面、静态资源、console 和 network。
- 再次验证 Admin hosting 内容未改变。
- 所有截图和日志不得暴露密钥。

只在证据齐全后完成 R18。
```

建议 commit：`chore: record independent competition deployment`

## S15：投稿材料与证据索引

```text
基于已验证的公开版本更新比赛提交材料，不修改业务功能。

必须如实表达：
- 原项目已有 Places、Events、Discover、Admin 和双语基础。
- 本次 TRAE 迭代新增访客画像、576 组合策展 matcher、四维解释、H5 路线闭环和在线/离线一致性。
- 产品运行时不调用 AI/LLM。
- TRAE 是比赛开发工具，Codex 只是补充 reviewer。
- Demo Confirm 不是真实报名。
- 无障碍反馈不是设施认证。

更新 submission-draft.md、demo-script.md、trae-evidence-log.md、参赛帖正文、2–3 分钟视频分镜、截图顺序，以及公开 URL、最终 commit、build ID、视频和离线包信息。

只有从 TRAE UI 复制的 Session ID 才能填写。任何仍缺失的 URL、截图或 ID 保持明确 PENDING，不得猜测。
```

建议 commit：`docs: finalize TRAE competition submission`

## 发布硬门禁

- OpenSpec strict validation 通过。
- 21/21 模块、576/576 场景、576 个唯一 key、1,152/1,152 双语案例、0 feedback mismatch。
- provider/local 语义一致 576/576。
- root typecheck、test、lint、H5 build、mp-weixin build 全部通过。
- 当前运行时、配置、构建产物和用户文案没有 Community Plan 模型调用、密钥、结果字段或 AI 生成宣称。
- 新 validation run 含真实 outputs/logs、必要 GUI 截图及 Supervisor verdict。
- 真实 TRAE Session ID、公开 URL、build ID、部署前后 hosting 证据齐全后才可完成 R18。
