# 公开发布闭环交接 - 2026-07-09

变更：`production-public-launch-closure`

## 如何使用

1. 这是当前公开发布结论页，先看 `Decision state`。
2. 若状态是 `blocked`，按“剩余阻塞项”补证据。
3. 补齐证据后，更新 Evidence Summary 和 Blockers，再重新选择唯一决策状态。
4. 早期 `production-readiness-acceptance` 只能作为 historical or production-like evidence。

Decision state: blocked

当前有意保持 blocked，因为微信账号/域名证据、CloudBase 控制台证据、生产 Admin 操作员证据、真机公开审核包证据、审核提交证据和发布审批都属于人工或 Mixed 工作，仓库内尚未提供这些 human evidence。

## Selected Target / 选定目标

| Item | Value |
| --- | --- |
| CloudBase target | `cloud1-d7gxdk8t43bd639c0` |
| CloudBase function | `community-map-api` |
| API route | `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` |
| Hosted Admin | `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/` |
| Mini Program app id | `wx7518a3c1fcdd39a5` |
| Public-review package path | `apps/mobile/dist/build/mp-weixin` |

## Evidence Summary / 证据汇总

| Evidence class | Status | Evidence |
| --- | --- | --- |
| ownership matrix | 已有当前验证 | `docs/public-launch-ownership-matrix.md` 和 task R1 bundle |
| Codex gates | 已有当前验证 | task R13 bundle |
| Mini Program artifact scan | 已有当前验证 | task R4/R5 bundle |
| Hosted Admin target | 已有当前验证 | task R9 bundle |
| Admin auth | 缺少线上人工证据 | task R7 本地门禁 + CloudBase operator 证据 |
| CloudBase target | 缺少人工控制台证据 | task R8 bundle + 控制台截图 |
| domain/account | 缺少人工证据 | task R12 evidence collector |
| true-device | 缺少人工证据 | task R11 runbook 和 evidence index |
| content/media audit | 已有样例审计，缺少编辑人工审核 | task R10 bundle |
| rollback | 文档已准备，缺少操作员证据 | `docs/mini-program-public-launch-manual.md` |
| monitoring | 文档已准备，缺少发布日值守证据 | `docs/mini-program-public-launch-manual.md` |

## Historical Evidence / 历史证据

`auto_test_openspec/production-readiness-acceptance/` 只能作为 historical or production-like evidence。它证明的是 CloudBase dev acceptance 和早期模块行为，不能替代公开发布需要的新证据：真机公开审核包、账号负责人合法域名确认、生产 Admin auth、生产内容/媒体审计、审核提交和发布审批。

## Remaining Blockers / 剩余阻塞项

| Blocker | Owner | Severity | Next action |
| --- | --- | --- | --- |
| 微信认证、备案、服务类目、隐私、服务器域名未提供证据 | WeChat account owner | Blocker | 用证据路径填写 `docs/public-launch-evidence-collector.template.json` 的副本 |
| CloudBase live provider mode、mock-header 禁用、Admin env vars、集合、索引、存储域名、安全规则需要控制台证据 | CloudBase operator | Blocker | 附上打码控制台截图或导出 |
| 持久化 Admin 操作员角色需要线上证明 | Admin operator / CloudBase operator | Blocker | 证明 Bearer 登录和 protected Admin routes 不依赖 `x-mock-user-id` |
| 缺少 iOS 和 Android true-device matrix | QA operator | Blocker | 执行 `docs/public-launch-true-device-runbook.md` |
| 审核上传/提交和发布审批未完成 | Release operator | Blocker | 只在阻塞项关闭后上传 `apps/mobile/dist/build/mp-weixin` 并提交审核 |

## Rollback And Monitoring / 回滚与监控

Previous known-good public version: 仓库内没有历史公开版本记录。

Rollback readiness: 使用微信版本管理撤回未通过审核版本，或暂停/回滚/替代已发布版本。记录操作员、时间、原因和截图证据。

Monitoring plan: 监控 CloudBase function logs、API `/health`、Hosted Admin 登录、小程序 tab smoke、requestId、媒体/域名失败、活动报名、Discover UGC/举报、Places 地图/导航。
