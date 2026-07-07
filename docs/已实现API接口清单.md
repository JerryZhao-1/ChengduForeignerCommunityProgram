# 已实现 API 接口清单

## 1. 文档说明

本清单基于当前仓库中的实际后端注册结果整理，判断依据来自以下代码：

- `apps/api/src/app.ts`：统一注册所有路由
- `apps/api/src/routes/*.ts`：实际路由定义
- `packages/shared/src/contracts/*.ts`：共享契约定义
- `apps/api/src/providers/*` 与 `packages/shared/src/mock/service.ts`：当前业务实现入口

截至当前版本，`apps/api` 一共注册了 35 个接口：

- 业务接口 34 个
- 健康检查接口 1 个：`GET /health`

## 2. 总入口与核心文件

| 类型               | 文件                                        | 说明                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 应用入口           | `apps/api/src/app.ts`                       | 创建 Koa 应用并注册所有路由                                                                                                                                                                                               |
| 路由注册           | `apps/api/src/routes/`                      | 按模块拆分的接口定义                                                                                                                                                                                                      |
| 路径常量           | `packages/shared/src/contracts/paths.ts`    | 前端和客户端统一使用的路径常量                                                                                                                                                                                            |
| 契约定义           | `packages/shared/src/contracts/`            | 请求方法、路径、请求/响应 schema 定义                                                                                                                                                                                     |
| Provider 选择      | `apps/api/src/providers/index.ts`           | 根据 `API_PROVIDER` 选择 mock 或 cloudbase                                                                                                                                                                                |
| Provider 接口      | `apps/api/src/providers/types.ts`           | 后端能力总接口定义                                                                                                                                                                                                        |
| 默认实现           | `apps/api/src/providers/mock/index.ts`      | 默认 provider，对接 mock service                                                                                                                                                                                          |
| 业务实现           | `packages/shared/src/mock/service.ts`       | 当前大部分接口的实际业务实现                                                                                                                                                                                              |
| CloudBase Provider | `apps/api/src/providers/cloudbase/index.ts` | 默认回退 mock provider；`CLOUDBASE_PROVIDER_MODE=live` 时 places、events、discover posts/comments 和 files complete/private-url 路径使用 CloudBase 文档数据库与临时文件 URL；notifications/auth 仍以 fallback parity 为主 |
| 移动端调用入口     | `apps/mobile/src/api/client.ts`             | 小程序端 API 客户端入口                                                                                                                                                                                                   |
| 管理端调用入口     | `apps/admin/src/api/client.ts`              | 管理后台 API 客户端入口                                                                                                                                                                                                   |
| 通用 HTTP Client   | `packages/shared/src/client.ts`             | 统一封装请求逻辑和路径调用                                                                                                                                                                                                |

## 3. 当前实现状态说明

| 运行模式    | 文件                                        | 说明                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mock`      | `apps/api/src/providers/mock/index.ts`      | 当前默认模式，大多数接口都可用                                                                                                                                                                                                                                                                                                                                        |
| `cloudbase` | `apps/api/src/providers/cloudbase/index.ts` | 默认回退 mock provider；live mode 已覆盖 places public list、map markers、detail、admin places create/list/update/delete，events list/detail/registration/admin create/list/update/delete/review/check-in/cover upload，discover posts/comments/owner posts/media binding 和 files complete/private-url 等路径；完整生产部署仍需在线集合、索引、安全规则和 smoke 证据 |

## 4. 接口清单

### 4.1 认证 Auth

| 方法   | 路径          | 用途                   | 路由文件                      | 契约文件                                | 业务实现                                              |
| ------ | ------------- | ---------------------- | ----------------------------- | --------------------------------------- | ----------------------------------------------------- |
| `POST` | `/auth/login` | 模拟登录并返回会话信息 | `apps/api/src/routes/auth.ts` | `packages/shared/src/contracts/auth.ts` | `packages/shared/src/mock/service.ts` 中 `auth.login` |
| `GET`  | `/auth/me`    | 获取当前用户会话信息   | `apps/api/src/routes/auth.ts` | `packages/shared/src/contracts/auth.ts` | `packages/shared/src/mock/service.ts` 中 `auth.me`    |

### 4.2 活动 Events

| 方法     | 路径                               | 用途                     | 路由文件                        | 契约文件                                  | 业务实现                                                                    |
| -------- | ---------------------------------- | ------------------------ | ------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `GET`    | `/events`                          | 获取活动列表             | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.list`                      |
| `GET`    | `/events/:id`                      | 获取活动详情             | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.detail`                    |
| `POST`   | `/events/:id/registrations`        | 创建活动报名并生成票据   | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.createRegistration`        |
| `GET`    | `/events/me/registrations`         | 获取当前用户的报名记录   | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.listMyRegistrations`       |
| `GET`    | `/events/registrations/:id/ticket` | 获取报名票据             | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.getTicketByRegistration`   |
| `GET`    | `/admin/events`                    | 管理端活动列表           | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.listAdmin`                 |
| `POST`   | `/admin/events`                    | 管理端创建活动           | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.create`                    |
| `POST`   | `/admin/events/cover-file`         | 管理端创建前上传活动封面 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/files.ts`  | `packages/shared/src/mock/service.ts` 中 `events.uploadCoverFile`           |
| `PATCH`  | `/admin/events/:id`                | 管理端更新活动           | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.update`                    |
| `DELETE` | `/admin/events/:id`                | 管理端删除活动           | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.delete`                    |
| `POST`   | `/admin/events/:id/cover-file`     | 管理端上传已有活动封面   | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/files.ts`  | `packages/shared/src/mock/service.ts` 中 `events.uploadCoverFile`           |
| `POST`   | `/admin/events/:id/review`         | 管理端审核活动           | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.review`                    |
| `GET`    | `/admin/events/:id/registrations`  | 管理端查看活动报名       | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.listRegistrationsForAdmin` |
| `POST`   | `/admin/events/:id/checkin`        | 管理端核销活动票据       | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.checkin`                   |

Events public reads 只返回 `review_status="approved"` 且 `publish_status="published"` 的目标社区活动；`GET /admin/events` 返回 draft、pending_review、approved、rejected 与 draft/published/offline/ended 管理态记录，并附带 active registration count、confirmed attendee count、remaining capacity 和 full state；`DELETE /admin/events/:id` 执行活动记录 hard delete，成功返回 `{ deleted_id }`，后续 admin/public event reads 不再返回该活动，但本 slice 不级联删除既有报名或票据；`POST /admin/events/cover-file` 与 `POST /admin/events/:id/cover-file` 支持 Admin multipart 本地图片上传并返回 `event_cover` 文件资产和封面字段，编辑已有活动时上传不会立即改活动记录，需随 `PATCH /admin/events/:id` 保存；活动封面也支持复用已发布地点图片：地点自有图集提交 `file_id` / `cloud_path` / 当前 URL，地点托管封面提交 `cover_file_id` / 当前 URL 且 `cover_cloud_path` 可为 `null`，Amap 外部图以 URL-only 保存并将 `cover_file_id` / `cover_cloud_path` 置为 `null`；CloudBase live 读取活动时会刷新 `public/events/` 与 `public/places/` 文件封面临时 URL；`GET /admin/events/:id/registrations` 返回联系人、人数、来源和 linked ticket state；报名会拒绝重复报名、不可见活动、容量满、报名截止；票据读取校验 owner/admin；核销校验活动-票据归属和票据状态。报名导出当前明确延后，尚未实现。

### 4.3 社区发现 Discover

| 方法   | 路径                                   | 用途           | 路由文件                          | 契约文件                                    | 业务实现                                                       |
| ------ | -------------------------------------- | -------------- | --------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `GET`  | `/discover/posts`                      | 获取帖子列表   | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.list`          |
| `GET`  | `/discover/posts/:id`                  | 获取帖子详情   | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.detail`        |
| `POST` | `/discover/posts`                      | 创建帖子       | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.create`        |
| `GET`  | `/discover/me/posts`                   | 获取我的帖子   | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.listMine`      |
| `GET`  | `/discover/posts/:id/comments`         | 获取帖子评论   | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.listComments`  |
| `POST` | `/discover/posts/:id/comments`         | 对帖子发表评论 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.createComment` |
| `POST` | `/discover/posts/:id/report`           | 举报帖子       | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.report`        |
| `POST` | `/admin/discover/posts/:id/moderation` | 管理端审核帖子 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.moderate`      |

Discover public reads 只返回 `status="visible"` 且 `review_status="visible"` 的目标社区帖子；hidden、deleted、reported 内容不会通过 public list/detail/comment list 暴露；`GET /discover/me/posts` 返回当前 actor 自己的 owner-visible 帖子并包含状态；评论读写只作用于 visible post；public `comment_count` 与可见评论列表使用相同过滤；创建帖子会初始化时间戳、计数、作者展示快照，并校验 `image_file_ids` 必须是本人上传的 active public `public/posts/` 文件资产；report 会进入治理状态并使 public reads 不再暴露该 post；admin moderation 需要管理员角色。

### 4.4 地点 Places

| 方法     | 路径                              | 用途                                                   | 路由文件                        | 契约文件                                  | 业务实现                                                                                                            | CloudBase 状态                          |
| -------- | --------------------------------- | ------------------------------------------------------ | ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `GET`    | `/places`                         | 获取地点列表，支持分页、关键字、分类、标签、推荐、排序 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.list`                                                              | 已实现                                  |
| `GET`    | `/places/map-markers`             | 获取地图标记点列表，含轻量封面预览                     | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.mapMarkers`                                                        | 已实现                                  |
| `GET`    | `/places/:id`                     | 获取地点详情                                           | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.detail`                                                            | 已实现                                  |
| `GET`    | `/admin/places`                   | 管理端地点列表                                         | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.listAdmin`                                                         | 已实现                                  |
| `GET`    | `/admin/places/poi-search`        | 管理端腾讯地图 POI 搜索                                | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `apps/api/src/lib/tencent-map.ts` 调用腾讯位置服务 WebServiceAPI                                                    | 已实现（需配置腾讯地图 key）            |
| `GET`    | `/admin/places/amap-media-search` | 管理端 Amap 图片候选搜索                               | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `apps/api/src/lib/amap.ts` 调用 Amap WebService POI 搜索并规范化 `photos`                                           | 已实现（需配置 `AMAP_WEB_SERVICE_KEY`） |
| `POST`   | `/admin/places`                   | 管理端新建地点                                         | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.create`                                                            | 已实现                                  |
| `PATCH`  | `/admin/places/:id`               | 管理端更新地点                                         | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.update`                                                            | 已实现                                  |
| `POST`   | `/admin/places/gallery-files`     | 管理端创建地点前上传地点图集图片                       | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/files.ts`  | mock provider / CloudBase live 创建 pending `FileAsset`；创建地点时按提交的 `gallery_file_ids` 自动绑定新地点       | 已实现                                  |
| `POST`   | `/admin/places/:id/gallery-files` | 管理端直接追加地点图集图片                             | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/files.ts`  | mock provider 创建 `FileAsset` 并追加 `gallery_file_ids`；CloudBase live 上传 storage、写 `file_assets`、更新 place | 已实现                                  |
| `DELETE` | `/admin/places/:id`               | 管理端删除地点                                         | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.delete`                                                            | 已实现                                  |

`GET /places` 当前是 public places list v1 的浏览入口：

- 支持 query：`page`、`pageSize`、`communityId`、`keyword`、`category`、`tag`、`recommended`、`sort`
- `sort` 仅支持 `recommended` 与 `name`，非法值会返回 `400`
- `category`、`tag`、`recommended`、`keyword` 使用 AND 语义组合；推荐地点入口仍调用 `/places?recommended=true&sort=recommended`
- 响应分页 envelope 为 `items`、`page`、`pageSize`、`total`
- public list 只返回 `status=published` 且属于目标 `communityId` 的地点
- list item 保持卡片字段边界，不返回详情专用字段，例如 `gallery_media`、`external_gallery_media`、`cover_source`、`gallery_urls`、`navigation`、完整地址字段
- `/places/map-markers` 是 marker-safe public contract，仅返回 `_id`、`name_zh`、`name_en`、`cover_url`、`category_level_1`、`is_recommended` 与 `location`；`cover_url` 为 `string | null`，只用于地图选中点位的轻量封面预览
- map marker payload 仍不返回详情专用或媒体归属字段，例如完整地址字段、简介正文、`gallery_media`、`gallery_urls`、`external_gallery_media`、`cover_source`、`navigation`
- `/places/:id` 负责详情字段，包括结构化自有图集 `gallery_media`、外部来源图集 `external_gallery_media`、外部封面来源 `cover_source`、派生兼容字段 `gallery_urls` 与 `navigation`
- 后台 places v1 支持维护双语简介、分类、标签、推荐状态/理由/排序、发布状态、坐标、腾讯 POI、导航/收藏/分享开关，并通过 `gallery_file_ids` 保存自有图集归属；Amap 图片候选保存为 `external_gallery_media` / `cover_source` 引用，不创建 `FileAsset`，不写入 `gallery_file_ids`
- 后台 places v1 支持通过 `GET /admin/places/poi-search` 代理腾讯地图地点搜索，候选结果只用于辅助填充中文名、中文地址、坐标和 `tencent_map_poi_id`；英文内容、分类和简介仍由后台人工维护
- 后台 places v1 支持通过 `GET /admin/places/amap-media-search` 代理 Amap WebService 搜索图片候选；API 只保存外部 URL 与来源归因，不下载、代理、缓存、转码或重新上传 Amap 图片
- 后台 places v1 支持通过 `POST /admin/places/gallery-files` 在创建地点前上传自有图集图片，创建地点时会按提交的 `gallery_file_ids` 自动把 pending `FileAsset` 绑定到新地点
- 后台 places v1 支持通过 `POST /admin/places/:id/gallery-files` 为已存在地点直接上传自有图集图片，成功后创建 active public `FileAsset` 并按顺序追加到 `gallery_file_ids`
- 后台 places v1 支持 partial update 和 hard delete；删除成功返回 `{ deleted_id }`，随后 admin list、public list、map marker、public detail 均不再返回该地点
- 后台 places v1 可保存志愿者导入草稿的 `import_review` 审核元数据；该字段仅属于 canonical/admin place 记录，public list、map marker、detail payload 均不返回原始采集证据或审核备注
- `scripts/places_volunteer_import.mjs` 可将 `docs/志愿者点位采集表.xlsx` 的 19 条点位列映射为 draft places，并可通过 `POST /admin/places` 执行导入
- `gallery_media` 是移动端详情页渲染自有图集的主字段；mock/本地 HTTP 路径会从已登记的 `file_assets` 与 `gallery_file_ids` 解析，CloudBase live places detail 会通过 CloudBase 临时文件 URL 解析 `gallery_file_ids`，`gallery_urls` 仅从 `gallery_media.url` 派生；外部图片只通过 `external_gallery_media` 渲染并必须显示来源归因
- 当前尚未声明 CloudBase 生产部署完成；非 places live providers 与完整线上验收仍属于后续 backend foundation / deployment 工作
- Week 8 CloudBase dev 部署与 `/api` route 仍未声明完成；2026-06-14 验证时 CloudBase MCP 未登录，详见 `docs/week8-places-cloudbase-integration.md`

### 4.5 公告 Announcements

| 方法  | 路径                 | 用途         | 路由文件                               | 契约文件                                         | 业务实现                                                        |
| ----- | -------------------- | ------------ | -------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `GET` | `/announcements`     | 获取公告列表 | `apps/api/src/routes/announcements.ts` | `packages/shared/src/contracts/announcements.ts` | `packages/shared/src/mock/service.ts` 中 `announcements.list`   |
| `GET` | `/announcements/:id` | 获取公告详情 | `apps/api/src/routes/announcements.ts` | `packages/shared/src/contracts/announcements.ts` | `packages/shared/src/mock/service.ts` 中 `announcements.detail` |

### 4.6 通知 Notifications

| 方法   | 路径                      | 用途                 | 路由文件                               | 契约文件                                         | 业务实现                                                          |
| ------ | ------------------------- | -------------------- | -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `GET`  | `/notifications`          | 获取当前用户通知列表 | `apps/api/src/routes/notifications.ts` | `packages/shared/src/contracts/notifications.ts` | `packages/shared/src/mock/service.ts` 中 `notifications.list`     |
| `POST` | `/notifications/:id/read` | 将通知标记为已读     | `apps/api/src/routes/notifications.ts` | `packages/shared/src/contracts/notifications.ts` | `packages/shared/src/mock/service.ts` 中 `notifications.markRead` |

Notifications list/read 只作用于当前 actor 自己的通知；跨用户 mark-read 返回 not-found envelope，不修改对方通知状态。

### 4.7 文件 Files

| 方法   | 路径                     | 用途                                 | 路由文件                       | 契约文件                                 | 业务实现                                                             |
| ------ | ------------------------ | ------------------------------------ | ------------------------------ | ---------------------------------------- | -------------------------------------------------------------------- |
| `POST` | `/files/upload-requests` | 创建上传请求，返回上传地址和云端路径 | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.createUploadRequest` |
| `POST` | `/files/complete`        | 提交上传完成后的文件记录             | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.complete`            |
| `POST` | `/files/private-url`     | 获取私有文件临时访问地址             | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.privateUrl`          |
| `POST` | `/files/post-media`      | 直接上传 discover 帖子图片或视频媒体 | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | mock provider / CloudBase live 创建 active public `FileAsset`        |

Files 当前允许 public upload request/complete；`public/places/`、`private/tickets/`、`private/exports/`、`private/admin/` 及对应 protected biz type 需要 admin；活动封面推荐走 `/admin/events/cover-file` 或 `/admin/events/:id/cover-file` 的直接 multipart 上传；帖子媒体推荐走 `/files/post-media` 直接 multipart 上传；private URL 会校验文件存在和 owner/admin 权限。

### 4.8 系统 System

| 方法  | 路径      | 用途         | 路由文件              | 备注                                                 |
| ----- | --------- | ------------ | --------------------- | ---------------------------------------------------- |
| `GET` | `/health` | 服务健康检查 | `apps/api/src/app.ts` | 该接口直接在 `app.ts` 中注册，没有单独 contract 文件 |

## 5. 前端客户端与接口映射

| 客户端文件                      | 说明                     | 关联路径来源                                                               |
| ------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `apps/mobile/src/api/client.ts` | 小程序端创建 API 客户端  | `packages/shared/src/client.ts` + `packages/shared/src/contracts/paths.ts` |
| `apps/admin/src/api/client.ts`  | 管理后台创建 API 客户端  | `packages/shared/src/client.ts` + `packages/shared/src/contracts/paths.ts` |
| `packages/shared/src/client.ts` | 统一封装所有接口调用方法 | `packages/shared/src/contracts/paths.ts`                                   |

当前 `packages/shared/src/client.ts` 中已经覆盖的客户端调用分组：

- `auth`
- `events`
- `discover`
- `places`
- `announcements`
- `notifications`
- `files`
- `admin`

## 6. 测试覆盖情况

接口联调与基础行为验证主要位于：

- `apps/api/test/app.spec.ts`
- `apps/api/test/cloudbase.spec.ts`
- `apps/api/test/integration-readiness.spec.ts`
- `packages/shared/test/integration-readiness.spec.ts`

当前测试已覆盖的重点包括：

- `events` 列表、详情、报名、管理端列表、管理端报名列表
- `events` public visibility、admin create/edit/publish/offline/re-publish、registration duplicate/full/closed/hidden、registration ticket join、ticket owner、check-in conflict/forbidden
- `discover` 列表、发帖、visible-only public reads、comment unavailable post、report hiding、admin moderation forbidden/success
- `files` public upload/complete、protected path denial、private URL owner/missing/forbidden
- `auth/role/notifications` invalid actor、non-admin protected mutation、notification ownership list/read/cross-user denial
- CloudBase handler fallback parity for representative non-places hardened paths
- `places` 列表、详情、地图标记、查询参数、tag/category/recommended 组合过滤、public published 可见性、管理端新增/更新/删除、文件流图集挂接
- `announcements` 列表
- 管理端权限校验
- 参数校验失败返回 `400`

## 7. 维护建议

- 新增接口时，按以下顺序更新：
  1. `packages/shared/src/schemas/*`
  2. `packages/shared/src/contracts/*`
  3. `packages/shared/src/contracts/paths.ts`
  4. `apps/api/src/routes/*`
  5. `apps/api/src/providers/*`
  6. `packages/shared/src/client.ts`
  7. 本文档
- 如果某个接口只在 contract 中存在、但未在 `apps/api/src/app.ts` 中注册，不应计入“已实现接口”。
- 如果某个接口已注册，但 provider 中明确抛出未实现错误，应在本文档中单独标明差异。
