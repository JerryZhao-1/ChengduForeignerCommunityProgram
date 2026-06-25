# 6.16-7.1 上线冲刺计划

更新时间：2026-06-24
本次调查时间：2026-06-24 11:42（Asia/Shanghai）
计划周期：2026-06-16 至 2026-07-01  
上线口径：达到可发布、可提交审核、可对外试运行状态；微信审核通过时间不等同于 7.1 当日上线完成。

## 1. 当前状态

### 已完成

- Places shared contracts 已基本冻结：
  - `PlaceListQuery`
  - `PlaceMapMarker`
  - `PlaceDetail`
  - admin places create/update contracts
- Places API / mock / CloudBase handler parity 已完成本地语义对齐：
  - public list
  - map markers
  - detail
  - admin create/update
  - validation / permission / not-found / unpublished visibility
- Mobile places 本地主链路已完成：
  - list
  - map
  - detail
  - category/tag filtering
  - recommended entry
  - navigation action
  - favorite/share-ready v1 seam
- Admin places 本地管理链路已完成：
  - create/edit place
  - coordinates / POI / bilingual intro
  - category / tag / recommendation state
  - gallery file attachment metadata
  - imported/incomplete record review indicators
- 志愿者点位导入已完成：
  - `docs/志愿者点位采集表.xlsx` 可由 `scripts/places_volunteer_import.mjs` 解析
  - 当前可解析 19 条 usable point records
  - 导入记录默认 `status="draft"`，不会自动公开
  - public list / marker / detail 不泄露 `import_review` 或原始志愿者证据
- 真实数据边界已完成本地处理：
  - no gallery
  - no tags
  - no recommendation
  - missing/unusable coordinates
  - missing address / optional text
- 最近一次本地核心验证结果：
  - 2026-06-24 `pnpm typecheck` 通过
  - 2026-06-24 `pnpm test` 通过，11 个测试文件 / 51 个测试通过
  - 2026-06-24 `pnpm lint` 通过；生成/部署包 `apps/api/.cloudbase/` 已按 generated output 加入 ESLint ignore，部署包仍由 CloudBase build/smoke evidence 覆盖
- CloudBase dev API 部署闭环已完成到 public read smoke：
  - MCP auth 已恢复并绑定 `cloud1-d7gxdk8t43bd639c0`
  - dev env、collections、places indexes、function、gateway、hosting 已实时查询
  - `community-map-api` 已替换为 CloudBase HTTP function
  - `/api` access route 已创建
  - `GET /api/health`、`GET /api/places`、`GET /api/places/map-markers` 通过 dev access domain
  - 证据见 `docs/cloudbase-dev-api-deployment.md`
- CloudBase dev places live data acceptance 已完成非图集闭环：
  - API base: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
  - 2026-06-23 baseline：live `places` 为空，随后导入 19 条志愿者草稿记录
  - published acceptance place：`CloudBase Live Acceptance Place` / `place_0dc2aece-6aa6-46c5-8971-57646636a22a`
  - 已验证 public list / map marker / detail、admin update 后 public 可见、imported draft public denial
  - CloudBase gallery media 仍是 blocker：当前 published acceptance place 没有真实 `cloud://` gallery file id，files provider live flow 尚未完成
- 6.19-6.21 本地/API readiness 已按证据补齐：
  - events public list/detail 仅返回 approved + published；registration 覆盖 duplicate、full、closed、hidden event、ticket owner、non-admin check-in、wrong-event ticket、already-used ticket。
  - discover public feed/detail 仅返回 visible；post create 初始状态稳定；comment/report/admin moderation 覆盖 unavailable post、reported/hidden public denial、non-admin forbidden。
  - files 覆盖 public upload request/complete、protected ticket/export/admin/place-gallery path denial、private URL owner/missing/forbidden。
  - auth/role/notifications 覆盖 invalid actor `401`、non-admin protected mutation `403`、notification ownership list/read/cross-user denial。
  - 证据：`packages/shared/test/integration-readiness.spec.ts`、`apps/api/test/integration-readiness.spec.ts`、`apps/api/test/app.spec.ts`、`apps/api/test/cloudbase.spec.ts`；2026-06-24 targeted Vitest 24 tests passed。

### 部分完成

- 微信小程序 AppID 已记录：`wx7518a3c1fcdd39a5`
- CloudBase dev 环境按文档已记录：
  - env id: `cloud1-d7gxdk8t43bd639c0`
  - region: `ap-shanghai`
  - env name: `cloud1`
- CloudBase dev v1 集合按文档已记录为 created：
  - `users`
  - `places`
  - `file_assets`
  - `configs`
  - `operation_logs`
- Places 索引按文档已记录为 created：
  - `community_id + status`
  - `category_level_1`
  - `category_level_2`
  - `is_recommended`
  - `recommended_rank`
- Admin hosting dev domain 已记录：
  - `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com`
- 2026-06-24 Admin hosting 复核：Admin bundle 已使用 `VITE_API_MODE=http` 和 CloudBase dev API base 重新构建并部署；hosted root 和 `/places` 均返回 200，SPA fallback 已配置。
- Mobile API client 已支持 `mock` / `http` / `cloudbase-function` 模式，并且 `cloudbase-function` 会优先使用 `wx.cloud.callHTTPFunction`。
- 2026-06-24 小程序 `cloudbase-function` build 已通过，导入路径：
  - `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- API CloudBase provider live mode 已覆盖 places，但只在同时满足以下条件时连接真实 CloudBase：
  - `API_PROVIDER=cloudbase`
  - `CLOUDBASE_PROVIDER_MODE=live`
  - `CLOUDBASE_ENV_ID` 或 `TCB_ENV` 已设置

### 状态边界 / 不得过度标记

- CloudBase dev places gallery media live acceptance 尚未完成：
  - 需要真实 CloudBase storage file id 挂接到 `public/places/{place_id}/`
  - 需要 detail 返回由 `gallery_file_ids` 解析出的 `gallery_media` 和派生 `gallery_urls`
- 微信开发者工具导入和主流程已验证：
  - DevTools service port `50375` 已开启；CLI 成功打开小程序构建目录并生成预览码；home、events、discover、places 主入口在模拟器可达。
- 真机 places map/navigation/share 已完成 release-readiness 验证：
  - 2026-06-24 iPhone 14 Pro / iOS 26.5 / WeChat 8.0.75 已验证小程序打开无白屏、Places list 可达、Places map 可达。
  - map 页出现 `Can't find variable: URL`；已修复 mobile CloudBase requester 的 URL 解析。
  - 分享提示“小程序未认证，暂时无法使用”，当前按小程序认证状态的平台限制记录。
  - `查看地图位置` 根因是 map 是 tabBar 页面，不能用 `navigateTo` 打开。已改为 `switchTab` 并用本地临时 storage 传递待聚焦 place id；2026-06-25 复测确认可跳转到 Places 地图页，并显示 `CloudBase Dev 验收点位`。
  - 2026-06-25 用户真机复测确认 native navigation 可用或出现可接受运行时权限 fallback；记录见 run `0021`。
- Admin hosting dev domain 已通过：
  - hosted root 和 `/places` 返回 200；bundle 内 API base 指向 CloudBase dev API domain。
- 当前 live `places` collection 包含 20 条验收数据：19 条 imported draft + 1 条 published acceptance place。不得把这些 dev 数据视为生产数据。
- 非 places live providers 尚未完成：
  - events
  - posts / discover
  - comments
  - announcements
  - notifications
  - files full live provider
- 6.19-6.21 readiness 当前只代表本地 mock provider、Koa HTTP route、CloudBase handler fallback parity；不得标记为 CloudBase live provider persistence 或生产数据 readiness。
- CloudBase prod 环境、prod 配置、生产数据写入策略和上线验收尚未完成。

事实来源：

- `docs/cloudbase-week4-deployment-baseline.md`
- `docs/week8-places-cloudbase-integration.md`
- `docs/cloudbase-dev-api-deployment.md`
- `docs/release-readiness-handoff-2026-06-24.md`
- `openspec/changes/complete-week8-places-cloudbase-integration-and-volunteer-import/tasks.md`
- `openspec/changes/complete-places-frontend-and-backend-foundation/tasks.md`
- `openspec/changes/archive/2026-06-22-complete-cloudbase-dev-api-deployment/tasks.md`
- `openspec/changes/archive/2026-06-23-complete-cloudbase-dev-places-live-acceptance/tasks.md`
- `openspec/changes/archive/2026-06-24-complete-events-discover-files-integration-readiness/tasks.md`

### 本次调查结论（2026-06-24）

- 项目当前处于 `2026-06-24 至 2026-06-30` 的全模块联调入口期，不是 release candidate。
- 按日期计划判断：
  - 6.16-6.21 已完成到本地/API readiness 和 CloudBase dev API/places 基础验收层级。
  - 6.22 小程序 `cloudbase-function` 构建、微信开发者工具导入、真机验证和 Admin hosting/API 联调已补证据。
  - 6.23 接口/配置冻结、数据清理分类、6.24 联调入口输出已记录在 `docs/release-readiness-handoff-2026-06-24.md`；`typecheck` / `test` / `lint` 均已通过。
  - 6.24 已完成 CloudBase dev HTTP smoke 的一部分：`/health`、places list/map/detail、events list/detail、discover feed/detail、`auth/me` 均返回 200；events/discover/auth 仍按非 places fallback 边界处理，不等同于 live persistence；files public/temp URL 尚未完成。
- 已完成的主要阶段：Places 本地前后台链路、CloudBase dev API HTTP function、`/api` route、places public read/admin update/draft visibility、events/discover/files/notifications/auth 本地/API 负路径。
- 仍阻塞上线闭环的 P0：真实 CloudBase gallery media/file id、files public/temp URL live 验收、prod env、数据库/存储安全规则、非 places live provider persistence。
- 进度评估：功能开发主体约完成到“可进入全模块联调”，上线准备约完成到“dev API 与本地业务基线可用”；距离 7.1 口径还剩联调、真机、真实媒体、生产配置、安全规则和发布交接。

## 2. 剩余上线任务

### 下一步执行顺序

1. 跑通真实 CloudBase storage/files live flow：上传或确认 `public/places/{place_id}/` 下真实 `cloud://` file id，完成 places detail `gallery_media` / `gallery_urls` temp URL 验收。
2. 补齐 6.24 API smoke 剩余项：files public/temp URL、operation_logs/生产级日志入口，并继续记录 requestId / logs / live-vs-fallback 边界。
3. 按 6.25-6.28 顺序完成 Places、Events、Discover、Files/Auth/Notifications 全链路联调；只修 P0/P1 缺陷。
4. 补齐发布项：腾讯地图 key 配置、prod env、安全规则、回滚方案和已知限制。

### P0: CloudBase 与部署阻塞项

- [x] 重新完成 CloudBase MCP 登录和环境绑定。
  - 验收：`auth_status=READY`，当前 env 绑定到 `cloud1-d7gxdk8t43bd639c0`。
- [x] 实时确认 CloudBase dev 环境、集合、索引、存储路径和 admin hosting 状态。
  - 验收：查询结果与 `docs/cloudbase-week4-deployment-baseline.md` 一致；差异必须记录并修复。
- [x] 将 `community-map-api` 部署为正式 CloudBase dev HTTP function。
  - 验收：函数入口复用 `apps/api/src/app.ts#createApp()`，不再作为 Event placeholder 处理。
- [x] 创建或确认 CloudBase HTTP access `/api` route。
  - 验收：只在函数验证成功后执行；dev access domain 可访问 `/api/health` 或等价 health route。
- [x] 配置并验证 CloudBase dev API 环境变量。
  - 验收：`API_PROVIDER=cloudbase`、`CLOUDBASE_PROVIDER_MODE=live`、env id 生效，places 读写不再回退 mock。
- [ ] 跑通 CloudBase dev places live acceptance。
  - 当前状态：public list / map / detail / admin create-update / draft visibility / published update 已通过；gallery media temp URL 因缺少真实 CloudBase file id 仍 blocked。
- [ ] 创建或确认 CloudBase prod 环境。
  - 验收：region 与 dev 对齐；发布准备完成前不写入生产业务数据。
- [ ] 制定并应用数据库安全规则。
  - 验收：public read、admin write、private file access、operation logs 写入权限边界明确。
- [ ] 验证云存储和真实媒体文件流。
  - 验收：places detail 可通过登记的 file/storage flow 渲染真实图片，不依赖硬编码 URL。

### P0: 三大模块最低上线闭环

- [ ] Places 上线闭环。
  - 必须覆盖：list、map、detail、filter、recommended、navigation、share、admin update、gallery display。
  - 验收：dev live 环境和小程序真机均通过。
- [ ] Events 最低上线闭环。
  - 必须覆盖：活动列表、活动详情、报名、票券、核销、admin 创建/编辑。
  - 当前状态：本地/API business guards 已通过 targeted tests；CloudBase live persistence、小程序真机和生产数据仍未验收。
  - 验收：成功路径、重复报名、无权限核销、活动不存在均有稳定响应。
- [ ] Discover 最低上线闭环。
  - 必须覆盖：内容流、发帖、评论、审核、举报或治理入口。
  - 当前状态：本地/API visibility、comment/report/moderation guards 已通过 targeted tests；CloudBase live persistence 和端侧全流程仍未验收。
  - 验收：公开内容可浏览；UGC 创建和审核路径不绕过 BFF。
- [ ] Files 最低上线闭环。
  - 必须覆盖：上传请求、完成登记、public file display、private file access denial。
  - 当前状态：本地/API public upload、protected path denial、private URL ownership 已通过 targeted tests；真实 CloudBase storage file id、gallery temp URL 和 files live provider 仍未验收。
  - 验收：public gallery 可展示，private ticket/export 不可被 public 读取。
- [ ] Notifications 最低上线闭环。
  - 必须覆盖：触发、列表、已读或最低反馈状态。
  - 当前状态：本地/API list/read ownership 已通过 targeted tests；provider-triggered outbound/push notification 不在本次证据范围。
  - 验收：关键事件不静默失败；失败路径有日志。
- [ ] Auth / role / permission 负路径。
  - 必须覆盖：未登录、普通用户访问 admin、非法 mock actor、缺失角色。
  - 当前状态：本地/API invalid actor 与 protected route denial 已通过 targeted tests；生产认证和 CloudBase security rules 仍未验收。
  - 验收：401 / 403 语义和 error envelope 稳定。

### P0: 小程序、Admin 与发布配置

- [x] 小程序 CloudBase function 模式构建和真机验证。
  - 当前状态：`cloudbase-function` build 已通过；微信开发者工具导入和主入口验证已通过；真机已验证打开、places list、places map 可达；map `URL` runtime blocker 已修复；`查看地图位置` 已改用 `switchTab` 打开 tabBar map 且复测通过；native navigation 已由用户真机复测确认；分享受小程序未认证限制。
  - 验收：`VITE_API_MODE=cloudbase-function`，env id 和 function name 生效；微信开发者工具和至少一台真机通过。
- [ ] 小程序体验版配置。
  - 验收：体验者权限、合法域名或 CloudBase 调用方式、定位/导航授权、分享行为均可用。
- [x] Admin 线上 API 配置。
  - 当前状态：2026-06-24 dev API health 返回 200；Admin hosted root 和 `/places` 返回 200；bundle API base 指向 CloudBase dev API domain。
  - 验收：admin static hosting 能访问 dev/prod API domain；刷新页面不路由失败。
- [ ] 腾讯地图 key 与域名/小程序配置。
  - 验收：地图、定位、导航在微信开发者工具和至少一台真机可用；key 不写入源码。
- [ ] 上线配置冻结。
  - 当前状态：6.24 dev integration 配置已冻结在 `docs/release-readiness-handoff-2026-06-24.md`；prod env 仍 pending。
  - 验收：dev/prod env id、API domain、function name、admin hosting domain、storage path、数据库集合记录在文档中。
- [ ] 日志和排查入口。
  - 验收：CloudBase function logs、operation_logs、关键错误 requestId 可追踪。

### P1: 上线质量与交接

- [ ] 非核心后台管理完善。
  - 范围：announcements、posts moderation、events 辅助字段、files/logs 最低页面。
- [ ] 数据清理和种子数据整理。
  - 范围：测试草稿、重复导入点位、无效坐标、无效媒体引用。
- [ ] 上线文档和交接说明。
  - 必须包含：稳定 API、字段边界、环境变量、部署步骤、回滚方式、已知限制。
- [ ] OpenSpec 状态整理。
  - 范围：已完成 change 可准备 archive；未完成 CloudBase live acceptance 保持可追踪。

## 3. 时间安排

### 2026-06-16 至 2026-06-23：上线前补齐期

目标：在进入 7 天联调前，所有阻塞联调的功能、部署、数据和配置必须可用。

#### 6.16 Tue

- [x] 完成新版 `docs/plan.md`。
- [x] 重新登录 CloudBase MCP，绑定 `cloud1-d7gxdk8t43bd639c0`。
- [x] 实时确认 dev env、collections、indexes、function、gateway、hosting 状态。
- [x] 将确认结果同步到部署登记文档。

退出标准：

- CloudBase 当前连接状态明确：要么验证通过，要么列出具体认证/权限 blocker。

#### 6.17 Wed

- [x] 部署或修复 `community-map-api` dev HTTP function。
- [x] 确认函数入口、runtime、env vars、logs。
- [x] 创建或确认 `/api` route。
- [x] 完成 `/health` 和 places read smoke。

退出标准：

- dev access domain 可调用 API；失败时必须有 CloudBase 日志和 requestId。

#### 6.18 Thu

- [x] 跑通 places live provider public read smoke。
- [x] 导入或创建最小 live places 数据。
- [x] 验证 public list / map markers / detail。
- [x] 验证 admin create/update 后 public read 可见性。

退出标准：

- places 在 CloudBase dev 中不依赖 mock-only data。

#### 6.19 Fri

- [x] 补齐 events 本地/API 最低上线链路。
- [x] 补齐 events admin 本地/API 最低管理动作。
- [x] 覆盖报名、票券、核销、权限负路径。

退出标准：

- events 不再阻塞本地/Koa/CloudBase handler fallback 联调；CloudBase live provider persistence、小程序真机和生产数据仍是后续上线验收范围。

#### 6.20 Sat

- [x] 补齐 discover 本地/API 最低上线链路。
- [x] 补齐 posts/comments/review/report 或治理路径。
- [x] 确认 public feed 不泄露未审核内容。

退出标准：

- discover 可进行本地/Koa/CloudBase handler fallback 联调；CloudBase live provider persistence 和端侧全流程仍需后续验证。

#### 6.21 Sun

- [x] 补齐 files、notifications、auth/role 本地/API 负路径。
- [x] 验证 public/private file access mock/API 权限。
- [x] 验证 notification list/read ownership 反馈状态。

退出标准：

- 文件、权限、通知不阻塞本地/Koa/CloudBase handler fallback 联调；真实 CloudBase storage rules、files live provider、notification trigger/outbound delivery 仍未验收。

#### 6.22 Mon

- [x] 小程序 cloudbase-function 构建。
- [x] 微信开发者工具导入并跑主流程。
- [x] 真机验证 places map/navigation/share。
- [x] Admin hosting 与 API domain 联调。

退出标准：

- 小程序体验版前置配置齐备；真机 blocker 已记录并分级。

#### 6.23 Tue

- [x] 联调前冻结接口和配置。
- [x] 清理测试数据和导入数据。
  - 当前状态：未删除生产数据；dev 数据已分类为 19 条 imported draft、1 条 published acceptance place、gallery/file live blocker 和 pending duplicate/test review。
- [x] 跑一次 `pnpm typecheck`、`pnpm test`、`pnpm lint`。
  - [x] 2026-06-24 复跑 `pnpm typecheck` 通过。
  - [x] 2026-06-24 复跑 `pnpm test` 通过，11 个测试文件 / 51 个测试通过。
  - [x] 2026-06-24 复跑 `pnpm lint` 通过；`apps/api/.cloudbase/` 作为 generated output 排除 source lint。
- [x] 输出 6.24 联调入口、账号、环境、数据清单。

退出标准：

- 6.24 可以开始全模块联调；未完成 P0 必须有负责人和当天修复窗口。

### 2026-06-24 至 2026-06-30：7 天全模块联调期

规则：

- 联调期不新增功能。
- 只接受 P0/P1 缺陷修复、配置修复、数据修复和文档修复。
- 每天结束必须更新 defect list、通过场景、阻塞场景和次日优先级。

#### 6.24 Wed：CloudBase dev 全链路和 API smoke

联调范围：

- CloudBase dev env
- HTTP function
- `/api` route
- API envelope
- requestId / logs
- mock vs live mode switch

必须通过：

- `/health`
- places list/map/detail
- events list/detail
- discover feed
- auth/me
- files public URL 或 temp URL

当前状态（2026-06-24 调查）：

- [x] 本地 `pnpm typecheck` 通过。
- [x] 本地 `pnpm test` 通过，11 个测试文件 / 51 个测试通过。
- [x] CloudBase dev `/api/health` 现场 HTTP smoke 返回 200。
- [x] CloudBase dev places list/map/detail 现场 HTTP smoke 返回 200；detail `gallery_media=0`、`gallery_urls=0`。
- [x] CloudBase dev events list/detail 现场 HTTP smoke 返回 200；仍视为 CloudBase handler fallback，不视为 live persistence。
- [x] CloudBase dev discover feed/detail 现场 HTTP smoke 返回 200；仍视为 CloudBase handler fallback，不视为 live persistence。
- [x] CloudBase dev `auth/me` 现场 HTTP smoke 返回 200；仍视为 mock actor/fallback 认证边界，不视为生产认证。
- [ ] CloudBase dev files public URL 或 temp URL 未完成；真实 gallery media temp URL 仍 blocked。
- [ ] CloudBase 日志可查有函数日志证据，但 `operation_logs` 写入和生产级日志排查入口尚未完成。

退出标准：

- API smoke 全部通过；CloudBase 日志可查；live/mock fallback 行为清楚。

#### 6.25 Thu：Places 全链路

联调范围：

- mobile places list
- map markers
- detail
- filtering
- recommended entry
- navigation
- share
- admin create/update
- gallery media
- imported draft review

必须通过：

- published place 出现在 public list/map/detail。
- draft place 不出现在 public list/map/detail。
- admin 更新后 mobile 能读到最新数据。
- missing coordinates 不生成 marker。
- gallery media 可渲染真实图片。

退出标准：

- places 可作为独立演示模块上线。

#### 6.26 Fri：Events 全链路

联调范围：

- events list/detail
- registration
- ticket
- checkin
- admin create/update/review
- permission negative paths

必须通过：

- 用户可报名。
- 重复报名或非法报名有稳定错误。
- 票券可展示。
- 无权限用户不能核销。
- admin 修改活动后 public 可读状态正确。

退出标准：

- events 满足最低上线闭环。

#### 6.27 Sat：Discover 全链路

联调范围：

- feed
- post creation
- comments
- moderation
- report/governance
- admin review

必须通过：

- public feed 只展示允许公开的内容。
- 用户发帖和评论成功或得到可解释错误。
- admin 审核能影响 public visibility。
- 举报或治理入口不会造成数据丢失。

退出标准：

- discover 满足最低上线闭环。

#### 6.28 Sun：Files / Auth / Permissions / Notifications 负路径

联调范围：

- public file
- private file
- upload request
- upload complete
- role resolution
- admin permission
- notification trigger/list/read
- invalid input and not-found

必须通过：

- public media 可读。
- private tickets/exports 不可 public 读取。
- 普通用户不能访问 admin actions。
- validation error 返回 400 和 `VALIDATION_ERROR`。
- not-found 返回稳定 envelope。

退出标准：

- 权限和文件边界可接受上线。

#### 6.29 Mon：小程序真机与体验质量

联调范围：

- 微信开发者工具
- 至少一台真机
- cloudbase-function API mode
- map/location/navigation authorization
- sharing
- weak network
- loading/empty/error states

必须通过：

- 小程序真机可打开主页面。
- places/events/discover 主入口可用。
- 导航授权失败时有可接受回退。
- 弱网下不出现白屏或无限 loading。

退出标准：

- 小程序体验版达到提交审核前质量。

#### 6.30 Tue：全量回归与发布候选冻结

联调范围：

- full regression
- data cleanup
- config freeze
- release candidate
- rollback rehearsal
- handoff notes

必须通过：

- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- OpenSpec strict validation for active release changes, or documented blockers
- Admin hosting access
- Mini Program trial package check

退出标准：

- 形成 release candidate；7.1 只允许修阻断问题。

### 2026-07-01 Wed：上线日

上线前检查：

- [ ] prod env 已确认。
- [ ] dev/prod 配置已冻结。
- [ ] admin hosting 可访问。
- [ ] CloudBase API domain 可访问。
- [ ] 小程序体验版可用，并已准备提交审核材料。
- [ ] CloudBase function logs 可查。
- [ ] operation logs 或关键业务日志可查。
- [ ] 回滚方案已记录。
- [ ] 已知限制已写入交接说明。

上线当天规则：

- 只修 P0/P1 阻断问题。
- 不合并新功能。
- 不做 schema 破坏性变更。
- 不写入未经确认的生产业务数据。
- 每个发布动作必须记录时间、操作者、环境、版本和结果。

上线完成定义：

- Admin 可访问并连接正确 API。
- 小程序体验版或提交审核包可用。
- Places / events / discover 最低主链路通过。
- 文件、权限、日志、回滚路径可验证。
- 未完成项全部进入 post-launch backlog，并明确优先级。

## 4. 测试与验收要求

### 本地验证

- 每次 P0 代码变更后至少运行相关包验证。
- 6.23 和 6.30 必须运行：
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm lint`
- Shared contract / API / provider 变更必须重点覆盖：
  - `packages/shared/test`
  - `apps/api/test`
  - CloudBase handler/provider parity tests

### CloudBase live 验收

本地测试通过不等于 live 验收通过。以下场景必须在 CloudBase dev 上验证：

- places public list/map/detail
- admin create/update
- gallery media temp URL
- draft/published visibility
- events registration/checkin
- discover post/comment/moderation
- files public/private boundary
- auth/role permission denial
- function logs and requestId tracing

### 小程序验收

- 微信开发者工具：
  - build/import
  - cloudbase-function API mode
  - route navigation
  - map/navigation authorization
- 真机：
  - places list/map/detail
  - events registration
  - discover post/comment
  - share
  - weak network loading/error

## 5. Assumptions

- 本计划只更新 `docs/plan.md`，不自动修改 OpenSpec task 状态，不修改代码。
- 当前项目评估日期按 2026-06-23 处理。
- 7 天联调固定为 2026-06-24 至 2026-06-30。
- CloudBase 未经重新登录和 live smoke test 前，不把“微信云数据库可连接”标为已完成。
- 7.1 是可发布/可提交审核/可对外试运行的上线口径；微信审核通过可能发生在 7.1 之后。
- 如果 CloudBase 认证、账号权限或微信审核资料阻塞，应立即升级为 P0 blocker，而不是继续按 mock 环境推进。
