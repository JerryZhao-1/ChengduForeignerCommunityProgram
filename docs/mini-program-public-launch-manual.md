# 小程序公开发布人工操作手册

本手册给微信账号负责人、CloudBase 负责人、QA、Admin 操作员和发布操作员使用。公开发布依赖控制台设置、真机证据和人工审批，Codex 不能代替账号负责人完成这些动作。

## 如何使用

1. 先按“微信账号准备”和“CloudBase 控制台检查”收集截图。
2. 再构建并上传公开审核包，路径必须是 `apps/mobile/dist/build/mp-weixin`。
3. 上传后按真机 runbook 执行 iOS 和 Android 验证。
4. 把所有截图、导出、版本号、审核记录填入 `docs/public-launch-evidence-collector.template.json` 的副本。
5. 更新最终 handoff；若证据不全，状态保持 `blocked`。

中英双语数据归属、fallback、Admin 修复、production-candidate export/audit 和 rollout/rollback 顺序统一遵循 [Mobile 中英双语运营与发布 Runbook](./mobile-bilingual-operations-and-release.md)。fixture audit 不能替代真实生产候选审计。

公开审核包路径：`apps/mobile/dist/build/mp-weixin`。

重要路径规则：根目录 `project.config.json is development-only`，它指向 `apps/mobile/dist/dev/mp-weixin/`。它不是 public-review upload path。

选定首次发布目标：

- 微信 app id：`wx7518a3c1fcdd39a5`
- CloudBase env id：`cloud1-d7gxdk8t43bd639c0`
- CloudBase function name：`community-map-api`
- API route：`https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Hosted Admin URL：`https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`

## WeChat account preparation / 微信账号准备

1. 确认小程序主体、名称、appid、管理员和发布操作员。
   Evidence: `wechat-account-identity.png` 和账号负责人确认记录。
2. 确认 certification 状态。
   Evidence: `wechat-certification-status.png`。
3. 确认 filing 状态。
   Evidence: `wechat-filing-status.png`。
4. 确认 service category，适配社区信息、本地服务或 UGC 地图产品。
   Evidence: `wechat-service-category.png`，并在 evidence collector 中写入类目名称。
5. 确认账号是否具备原生分享能力。
   Evidence: `wechat-share-capability.png`；如果不可用，记录已接受的复制链接 fallback 决策。

## privacy / 隐私和用户数据披露

1. 审核登录、个人资料、定位、图片上传、报名、票券、评论、举报、点赞、收藏和关注的数据用途。
   Evidence: `privacy-data-scope-review.md`。
2. 在微信后台配置 privacy disclosures。
   Evidence: `wechat-privacy-disclosure.png`。
3. 审核备注中说明定位权限 fallback、媒体上传用途、UGC 审核和账号联系/删除路径。
   Evidence: `review-notes-privacy-section.md`。

## request domain / upload domain / download domain / media domain

1. 为选定 API 或 CloudBase 函数配置 request domain。
   Evidence: `wechat-request-domain.png`。
2. 为图片/媒体上传配置 upload domain。
   Evidence: `wechat-upload-domain.png`。
3. 为私有或签名文件获取配置 download domain。
   Evidence: `wechat-download-domain.png`。
4. 为公开媒体和 CloudBase storage 配置 media domain。
   Evidence: `wechat-media-domain.png`。
5. 真机验证时确认没有开启“不校验合法域名 / TLS / HTTPS 证书”或 debug bypass。
   Evidence: iOS 和 Android 设备日志或截图。

## CloudBase console / CloudBase 控制台检查

1. 确认 env id 为 `cloud1-d7gxdk8t43bd639c0`。
   Evidence: `cloudbase-env-id.png`。
2. 确认函数 `community-map-api` 已部署并暴露 `/api`。
   Evidence: `cloudbase-function-route.png`。
3. 确认生产 provider mode 使用 `CLOUDBASE_PROVIDER_MODE=live`。
   Evidence: `cloudbase-provider-mode.png`。
4. 确认 `API_ALLOW_MOCK_ACTOR_HEADER` 未配置或为 false。
   Evidence: `cloudbase-mock-header-disabled.png`。
5. 确认 Admin 环境变量已配置且截图要打码：`API_ADMIN_USERNAME`、`API_ADMIN_PASSWORD_SCRYPT`、`API_ADMIN_SESSION_SECRET`、`API_ADMIN_USER_ID`，可选 `API_ADMIN_SESSION_TTL_SECONDS`。
   Evidence: redacted `cloudbase-admin-env-vars.png`。
6. 确认 database collections、required indexes、database collections ownership、security rules 覆盖 places、events、registrations、tickets、posts、comments、reports、users、notifications、file records、audit records。
   Evidence: `cloudbase-database-collections.png`、`cloudbase-indexes.png`、`cloudbase-security-rules.png`。
7. 确认 storage domains 和 bucket 权限。
   Evidence: `cloudbase-storage-domains.png`。

## map key / 地图 Key 检查

1. 确认 Tencent map key 和 secret 只配置在服务端，不暴露为 `VITE_`。
   Evidence: `tencent-map-key-restrictions.png`。
2. 如仍启用高德媒体候选搜索，确认 Amap WebService key 只配置在服务端。
   Evidence: `amap-key-restrictions.png`。
3. 确认 key restrictions 匹配生产或生产预览域名。
   Evidence: 限制截图和负责人签字。

## review upload / 公开审核包构建与上传

上传前必须保存真实 `production-candidate` 内容导出及来源证明，运行双语审计并确认 `blocking=0`、`editorial=0`、`releaseEligible=true`。原始生产导出不得提交到 Git；只保存脱敏审计结果与证据索引。

1. 在仓库根目录构建公开审核包：

   ```bash
   VITE_API_MODE=cloudbase-function \
   VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 \
   VITE_CLOUDBASE_FUNCTION_NAME=community-map-api \
   pnpm --filter @community-map/mobile build:mp-weixin
   ```

   Evidence: 命令日志和产物扫描报告。
2. 通过微信 DevTools 或 `miniprogram-ci` 上传 `apps/mobile/dist/build/mp-weixin`。
   Evidence: `wechat-upload-version.png`、上传版本、上传人、上传时间、确切路径。
3. 不要上传 `apps/mobile/dist/dev/mp-weixin`。
   Evidence: 发布操作员确认记录。
4. 如果使用 `miniprogram-ci`，上传密钥不能入库，只记录 key id/class 和 IP 白名单状态。
   Evidence: 打码 `miniprogram-ci-key-status.png`。

## true-device / 真机验证

针对已上传或预览的公开审核包，分别执行 iOS 和 Android 检查。使用 `docs/public-launch-true-device-runbook.md`。

必须覆盖：

- Home tab
- Events list/detail/registration/ticket
- Discover feed/create/comment/like/favorite/share-or-fallback/report
- Places list/map/detail/navigation/share-or-fallback
- Me tab、语言设置、报名、帖子、评论、举报、点赞、收藏、关注、通知
- CloudBase calls
- legal-domain behavior without debug bypass
- map 和 location permission fallback
- media loading
- upload
- Admin governance evidence

Evidence: 设备型号、OS 版本、WeChat 版本、package version、截图/日志、失败说明和 result。

## review submission / 审核提交

1. 准备审核备注，说明发布范围、tab、测试路径、隐私说明、定位用途、媒体上传用途、审核治理和 fallback 行为。
   Evidence: `wechat-review-notes.md`。
2. 提交已上传版本到微信审核。
   Evidence: `wechat-review-submission.png`、submitted version、operator、submission time。
3. 如需测试账号或操作说明，只提交打码信息，不把明文密码写进仓库。
   Evidence: 打码测试账号交接记录。

## phased release / 灰度发布

1. 审核通过后，选择灰度比例；如果跳过灰度，需要写明理由。
   Evidence: 发布审批记录。
2. 确认监控负责人在首个监控窗口在线。
   Evidence: 发布日值守名单。
3. 执行灰度发布。
   Evidence: `wechat-phased-release.png`、版本、比例、发布时间、发布人。

## full release / 全量发布

1. 确认审核通过、真机验证、内容/媒体审计、Admin auth、域名、rollback、monitoring 均完成。
   Evidence: 最终 handoff 及证据链接。
2. 执行全量公开发布。
   Evidence: `wechat-full-release.png`、版本、发布时间、发布人。

## rollback / 回滚

1. 如果还未提交审核，不提交，直接在 handoff 记录 blocker。
   Evidence: blocker owner/action 行。
2. 如果已提交但未通过，在微信版本管理中撤回或替换审核版本。
   Evidence: `wechat-review-withdrawal.png`。
3. 如果已发布，按微信版本管理能力暂停、回滚、撤回或发布替代版本。
   Evidence: 回滚动作截图、操作员、时间、原因、previous known-good version。若无历史公开版本，记录“no previous public version”。

## post-release monitoring / 发布后监控

1. 观察 CloudBase function logs 的错误、延迟和 requestId。
   Evidence: `cloudbase-function-monitoring.png`。
2. 对 `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health` 执行 API health checks。
   Evidence: health-check log。
3. 验证 Hosted Admin 登录和 protected route。
   Evidence: Admin 登录截图，不能暴露密码。
4. iOS 和 Android smoke Home、Events、Discover、Places、Me。
   Evidence: 发布日截图。
5. 记录事件 requestId，并按严重程度决定 rollback、pause 或 hotfix。
   Evidence: incident record，含 owner 和 decision。
