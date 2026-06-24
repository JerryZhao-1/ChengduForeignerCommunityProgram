# 已实现 API 接口清单

## 1. 文档说明

本清单基于当前仓库中的实际后端注册结果整理，判断依据来自以下代码：

- `apps/api/src/app.ts`：统一注册所有路由
- `apps/api/src/routes/*.ts`：实际路由定义
- `packages/shared/src/contracts/*.ts`：共享契约定义
- `apps/api/src/providers/*` 与 `packages/shared/src/mock/service.ts`：当前业务实现入口

截至当前版本，`apps/api` 一共注册了 31 个接口：

- 业务接口 30 个
- 健康检查接口 1 个：`GET /health`

## 2. 总入口与核心文件

| 类型 | 文件 | 说明 |
| --- | --- | --- |
| 应用入口 | `apps/api/src/app.ts` | 创建 Koa 应用并注册所有路由 |
| 路由注册 | `apps/api/src/routes/` | 按模块拆分的接口定义 |
| 路径常量 | `packages/shared/src/contracts/paths.ts` | 前端和客户端统一使用的路径常量 |
| 契约定义 | `packages/shared/src/contracts/` | 请求方法、路径、请求/响应 schema 定义 |
| Provider 选择 | `apps/api/src/providers/index.ts` | 根据 `API_PROVIDER` 选择 mock 或 cloudbase |
| Provider 接口 | `apps/api/src/providers/types.ts` | 后端能力总接口定义 |
| 默认实现 | `apps/api/src/providers/mock/index.ts` | 默认 provider，对接 mock service |
| 业务实现 | `packages/shared/src/mock/service.ts` | 当前大部分接口的实际业务实现 |
| CloudBase Provider | `apps/api/src/providers/cloudbase/index.ts` | 默认回退 mock provider；`CLOUDBASE_PROVIDER_MODE=live` 时 places list/map/detail/admin 路径使用 CloudBase 文档数据库与临时文件 URL；events/discover/files/notifications/auth 当前只完成 fallback parity，不代表 live persistence |
| 移动端调用入口 | `apps/mobile/src/api/client.ts` | 小程序端 API 客户端入口 |
| 管理端调用入口 | `apps/admin/src/api/client.ts` | 管理后台 API 客户端入口 |
| 通用 HTTP Client | `packages/shared/src/client.ts` | 统一封装请求逻辑和路径调用 |

## 3. 当前实现状态说明

| 运行模式 | 文件 | 说明 |
| --- | --- | --- |
| `mock` | `apps/api/src/providers/mock/index.ts` | 当前默认模式，大多数接口都可用 |
| `cloudbase` | `apps/api/src/providers/cloudbase/index.ts` | 默认回退 mock provider；live mode 已覆盖 places public list、map markers、detail、admin places create/list/update，events/discover/files/notifications/auth 只完成 handler fallback parity，非 places live providers 和生产部署仍未完成 |

## 4. 接口清单

### 4.1 认证 Auth

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | 模拟登录并返回会话信息 | `apps/api/src/routes/auth.ts` | `packages/shared/src/contracts/auth.ts` | `packages/shared/src/mock/service.ts` 中 `auth.login` |
| `GET` | `/auth/me` | 获取当前用户会话信息 | `apps/api/src/routes/auth.ts` | `packages/shared/src/contracts/auth.ts` | `packages/shared/src/mock/service.ts` 中 `auth.me` |

### 4.2 活动 Events

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/events` | 获取活动列表 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.list` |
| `GET` | `/events/:id` | 获取活动详情 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.detail` |
| `POST` | `/events/:id/registrations` | 创建活动报名并生成票据 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.createRegistration` |
| `GET` | `/events/me/registrations` | 获取当前用户的报名记录 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.listMyRegistrations` |
| `GET` | `/events/registrations/:id/ticket` | 获取报名票据 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.getTicketByRegistration` |
| `POST` | `/admin/events` | 管理端创建活动 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.create` |
| `PATCH` | `/admin/events/:id` | 管理端更新活动 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.update` |
| `POST` | `/admin/events/:id/review` | 管理端审核活动 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.review` |
| `POST` | `/admin/events/:id/checkin` | 管理端核销活动票据 | `apps/api/src/routes/events.ts` | `packages/shared/src/contracts/events.ts` | `packages/shared/src/mock/service.ts` 中 `events.checkin` |

Events public reads 只返回 `review_status="approved"` 且 `publish_status="published"` 的目标社区活动；报名会拒绝重复报名、不可见活动、容量满、报名截止；票据读取校验 owner/admin；核销校验活动-票据归属和票据状态。

### 4.3 社区发现 Discover

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/discover/posts` | 获取帖子列表 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.list` |
| `GET` | `/discover/posts/:id` | 获取帖子详情 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.detail` |
| `POST` | `/discover/posts` | 创建帖子 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.create` |
| `POST` | `/discover/posts/:id/comments` | 对帖子发表评论 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.createComment` |
| `POST` | `/discover/posts/:id/report` | 举报帖子 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.report` |
| `POST` | `/admin/discover/posts/:id/moderation` | 管理端审核帖子 | `apps/api/src/routes/discover.ts` | `packages/shared/src/contracts/discover.ts` | `packages/shared/src/mock/service.ts` 中 `posts.moderate` |

Discover public reads 只返回 `status="visible"` 且 `review_status="visible"` 的目标社区帖子；hidden、deleted、reported 内容不会通过 public list/detail 暴露；评论只允许写入 visible post；report 会进入治理状态并使 public reads 不再暴露该 post；admin moderation 需要管理员角色。

### 4.4 地点 Places

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 | CloudBase 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/places` | 获取地点列表，支持分页、关键字、分类、标签、推荐、排序 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.list` | 已实现 |
| `GET` | `/places/map-markers` | 获取地图标记点列表 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.mapMarkers` | 已实现 |
| `GET` | `/places/:id` | 获取地点详情 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.detail` | 已实现 |
| `GET` | `/admin/places` | 管理端地点列表 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.listAdmin` | 已实现 |
| `POST` | `/admin/places` | 管理端新建地点 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.create` | 已实现 |
| `PATCH` | `/admin/places/:id` | 管理端更新地点 | `apps/api/src/routes/places.ts` | `packages/shared/src/contracts/places.ts` | `packages/shared/src/mock/service.ts` 中 `places.update` | 已实现 |

`GET /places` 当前是 public places list v1 的浏览入口：

- 支持 query：`page`、`pageSize`、`communityId`、`keyword`、`category`、`tag`、`recommended`、`sort`
- `sort` 仅支持 `recommended` 与 `name`，非法值会返回 `400`
- `category`、`tag`、`recommended`、`keyword` 使用 AND 语义组合；推荐地点入口仍调用 `/places?recommended=true&sort=recommended`
- 响应分页 envelope 为 `items`、`page`、`pageSize`、`total`
- public list 只返回 `status=published` 且属于目标 `communityId` 的地点
- list item 保持卡片字段边界，不返回详情专用字段，例如 `gallery_media`、`gallery_urls`、`navigation`、完整地址字段
- `/places/:id` 负责详情字段，包括结构化 `gallery_media`、派生兼容字段 `gallery_urls` 与 `navigation`
- 后台 places v1 支持维护双语简介、分类、标签、推荐状态/理由/排序、发布状态、坐标、腾讯 POI、导航/收藏/分享开关，并通过 `gallery_file_ids` 保存图集归属
- 后台 places v1 可保存志愿者导入草稿的 `import_review` 审核元数据；该字段仅属于 canonical/admin place 记录，public list、map marker、detail payload 均不返回原始采集证据或审核备注
- `scripts/places_volunteer_import.mjs` 可将 `docs/志愿者点位采集表.xlsx` 的 19 条点位列映射为 draft places，并可通过 `POST /admin/places` 执行导入
- `gallery_media` 是移动端详情页渲染图集的主字段；mock/本地 HTTP 路径会从已登记的 `file_assets` 与 `gallery_file_ids` 解析，CloudBase live places detail 会通过 CloudBase 临时文件 URL 解析 `gallery_file_ids`，`gallery_urls` 仅从 `gallery_media.url` 派生
- 当前尚未声明 CloudBase 生产部署完成；非 places live providers 与完整线上验收仍属于后续 backend foundation / deployment 工作
- Week 8 CloudBase dev 部署与 `/api` route 仍未声明完成；2026-06-14 验证时 CloudBase MCP 未登录，详见 `docs/week8-places-cloudbase-integration.md`

### 4.5 公告 Announcements

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/announcements` | 获取公告列表 | `apps/api/src/routes/announcements.ts` | `packages/shared/src/contracts/announcements.ts` | `packages/shared/src/mock/service.ts` 中 `announcements.list` |
| `GET` | `/announcements/:id` | 获取公告详情 | `apps/api/src/routes/announcements.ts` | `packages/shared/src/contracts/announcements.ts` | `packages/shared/src/mock/service.ts` 中 `announcements.detail` |

### 4.6 通知 Notifications

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/notifications` | 获取当前用户通知列表 | `apps/api/src/routes/notifications.ts` | `packages/shared/src/contracts/notifications.ts` | `packages/shared/src/mock/service.ts` 中 `notifications.list` |
| `POST` | `/notifications/:id/read` | 将通知标记为已读 | `apps/api/src/routes/notifications.ts` | `packages/shared/src/contracts/notifications.ts` | `packages/shared/src/mock/service.ts` 中 `notifications.markRead` |

Notifications list/read 只作用于当前 actor 自己的通知；跨用户 mark-read 返回 not-found envelope，不修改对方通知状态。

### 4.7 文件 Files

| 方法 | 路径 | 用途 | 路由文件 | 契约文件 | 业务实现 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/files/upload-requests` | 创建上传请求，返回上传地址和云端路径 | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.createUploadRequest` |
| `POST` | `/files/complete` | 提交上传完成后的文件记录 | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.complete` |
| `POST` | `/files/private-url` | 获取私有文件临时访问地址 | `apps/api/src/routes/files.ts` | `packages/shared/src/contracts/files.ts` | `packages/shared/src/mock/service.ts` 中 `files.privateUrl` |

Files 当前允许 public upload request/complete；`public/places/`、`private/tickets/`、`private/exports/`、`private/admin/` 及对应 protected biz type 需要 admin；private URL 会校验文件存在和 owner/admin 权限。

### 4.8 系统 System

| 方法 | 路径 | 用途 | 路由文件 | 备注 |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | 服务健康检查 | `apps/api/src/app.ts` | 该接口直接在 `app.ts` 中注册，没有单独 contract 文件 |

## 5. 前端客户端与接口映射

| 客户端文件 | 说明 | 关联路径来源 |
| --- | --- | --- |
| `apps/mobile/src/api/client.ts` | 小程序端创建 API 客户端 | `packages/shared/src/client.ts` + `packages/shared/src/contracts/paths.ts` |
| `apps/admin/src/api/client.ts` | 管理后台创建 API 客户端 | `packages/shared/src/client.ts` + `packages/shared/src/contracts/paths.ts` |
| `packages/shared/src/client.ts` | 统一封装所有接口调用方法 | `packages/shared/src/contracts/paths.ts` |

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

- `events` 列表、详情、报名
- `events` public visibility、admin publish、registration duplicate/full/closed/hidden、ticket owner、check-in conflict/forbidden
- `discover` 列表、发帖、visible-only public reads、comment unavailable post、report hiding、admin moderation forbidden/success
- `files` public upload/complete、protected path denial、private URL owner/missing/forbidden
- `auth/role/notifications` invalid actor、non-admin protected mutation、notification ownership list/read/cross-user denial
- CloudBase handler fallback parity for representative non-places hardened paths
- `places` 列表、详情、地图标记、查询参数、tag/category/recommended 组合过滤、public published 可见性、管理端新增/更新、文件流图集挂接
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
