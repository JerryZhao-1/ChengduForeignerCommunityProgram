# 公开发布权责矩阵

变更：`production-public-launch-closure`

## 如何使用

1. 发布前先读本文件，确认每个前置项属于 `Codex-owned`、`Human-owned` 还是 `Mixed`。
2. `Codex-owned` 项可以由脚本、构建、扫描、测试证据关闭。
3. `Human-owned` 项必须由微信/CloudBase/真机/运营负责人提供截图、导出或审批记录，Codex 不能代替完成。
4. `Mixed` 项必须同时具备 Codex 证据和人工证据。
5. 最终发布状态只能从下面 5 个英文状态中选一个；这些英文值会被脚本校验，不要翻译：
   - `blocked`
   - `ready for WeChat review upload`
   - `ready for review submission`
   - `ready for phased release`
   - `ready for full public release`

本表也是 closure status model。表头中的 `owner role`、`required evidence`、`blocker severity`、`decision state gated` 为校验关键字，请保留。

| 前置项 | 权责类型 | owner role | required evidence | blocker severity | decision state gated | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| OpenSpec 任务、源码检查、构建、lint、测试、发布验证 bundle | Codex-owned | Codex worker | `auto_test_openspec/production-public-launch-closure/` 下的当前命令日志 | Blocker | `ready for WeChat review upload` | 已生成当前证据 |
| 小程序公开审核包使用 `cloudbase-function` 模式构建 | Codex-owned | Codex worker | 构建命令、`apps/mobile/dist/build/mp-weixin`、appid、CloudBase 环境 ID、函数名、产物扫描报告 | Blocker | `ready for WeChat review upload` | 已生成当前证据 |
| 产物扫描：本地端点、mock actor header、fixture media、未声明目标 | Codex-owned | Codex worker | 机器可读扫描报告，列出命中文件或 clean 结果 | Blocker | `ready for WeChat review upload` | 已生成当前证据 |
| DevTools 或 `miniprogram-ci` 上传路径统一 | Mixed | Codex worker / release operator | 文档声明 `apps/mobile/dist/build/mp-weixin`；上传人提供使用该路径的截图或上传日志 | Blocker | `ready for WeChat review upload` | Codex 文档已完成，人工上传证据待补 |
| Admin 通过 `POST /auth/admin/login` 和 Bearer token 登录 | Mixed | Codex worker / CloudBase operator / Admin operator | API 测试日志、Hosted Admin URL、API target、操作员用户 ID、角色、token TTL 分类、受保护路由验证 | Blocker | `ready for WeChat review upload` | 本地门禁已完成，线上操作员证据待补 |
| live Admin API 禁用 mock actor header | Mixed | Codex worker / CloudBase operator | `CLOUDBASE_PROVIDER_MODE=live`、`API_ALLOW_MOCK_ACTOR_HEADER` 未开启，只有 `x-mock-user-id` 调 protected route 被拒绝 | Blocker | `ready for WeChat review upload` | 本地门禁已完成，线上配置证据待补 |
| 持久化 Admin 角色数据 | Human-owned | CloudBase operator | 用户记录或受控角色存储截图，显示 active 且具备 `community_admin` 或 `system_admin` | Blocker | `ready for WeChat review upload` | 待人工证据 |
| 选定 CloudBase 发布目标 | Mixed | CloudBase operator / Codex worker | 环境 `cloud1-d7gxdk8t43bd639c0`、函数 `community-map-api`、API 路由、provider mode、必要环境变量 | Blocker | `ready for WeChat review upload` | 目标已写入文档，控制台证据待补 |
| CloudBase 数据库集合、索引、安全规则 | Human-owned | CloudBase operator | 集合、索引、安全规则、读写权限的控制台截图或导出 | Blocker | `ready for review submission` | 待人工证据 |
| 微信账号认证、备案、服务类目 | Human-owned | WeChat account owner | 微信后台截图或导出，包含认证、备案、类目、主体信息 | Blocker | `ready for review submission` | 待人工证据 |
| 隐私披露和用户数据范围 | Human-owned | WeChat account owner / release operator | 隐私协议截图、用户信息处理范围、审核材料说明、审批记录 | Blocker | `ready for review submission` | 待人工证据 |
| request/upload/download/media 合法域名 | Human-owned | WeChat account owner | 微信后台域名截图/导出；真机证明不依赖调试域名绕过 | Blocker | `ready for review submission` | 待人工证据 |
| 腾讯地图和高德 Key 生产限制 | Human-owned | Map-key owner | 控制台截图，证明域名/appid/IP 限制和服务端密钥存储 | Blocker | `ready for review submission` | 待人工证据 |
| iOS 真机公开审核包验证 | Human-owned | QA operator | 设备型号、系统、微信版本、包版本、Home/Events/Discover/Places/Me、地图、媒体、上传、分享/fallback、权限截图或日志 | Blocker | `ready for full public release` | 待人工证据 |
| Android 真机公开审核包验证 | Human-owned | QA operator | 设备型号、系统、微信版本、包版本、Home/Events/Discover/Places/Me、地图、媒体、上传、分享/fallback、权限截图或日志 | Blocker | `ready for full public release` | 待人工证据 |
| 生产内容与媒体审计 | Mixed | Codex worker / content owner | 机器审计报告；外部媒体、双语字段和内容合规由人工确认 | Blocker | `ready for full public release` | Codex 审计样例已完成，编辑审核待补 |
| 微信代码上传和审核提交 | Human-owned | Release operator | 上传版本、上传路径、审核备注、截图、提交回执、测试账号/操作说明 | Blocker | `ready for review submission` 及更高状态 | 待人工证据 |
| 审核通过和发布审批 | Human-owned | WeChat account owner / release approver | 审核通过截图、发布审批记录、发布方式、发布人、发布时间 | Blocker | `ready for phased release` / `ready for full public release` | 待人工证据 |
| 回滚准备和上一版可用版本 | Mixed | Release operator / Codex worker | 操作文档、上一版版本号或“无历史公开版本”、撤回/暂停/回滚步骤、负责人 | Blocker | `ready for phased release` | 文档已完成，操作员证据待补 |
| 发布后监控 | Mixed | Release operator / CloudBase operator / Admin operator | CloudBase 日志、API health、Admin 登录、小程序 smoke、requestId、回滚触发条件 | Major | `ready for phased release` / `ready for full public release` | 文档已完成，人工值守证据待补 |

状态推进规则：`Codex-owned` 行由当前验证证据关闭；`Human-owned` 行只能由人工 evidence pointers 关闭；`Mixed` 行必须同时具备两类证据。
