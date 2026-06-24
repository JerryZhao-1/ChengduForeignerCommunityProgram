# API 接口使用手册

更新时间：2026-06-24  
适用对象：Mobile、小程序、Admin、events、discover、places、files、notifications 等模块开发者  
事实来源：`packages/shared/src/contracts/*`、`packages/shared/src/schemas/*`、`apps/api/src/routes/*`、`docs/已实现API接口清单.md`

## 1. 当前完善度结论

当前 API 已经可以支撑本地 mock / HTTP 联调和主要模块开发：

- 已完善：
  - 本地 Koa HTTP route 注册完整。
  - Shared contract / schema 覆盖当前已实现接口。
  - Places 主链路已覆盖 list、map markers、detail、admin list/create/update、gallery metadata、志愿者导入草稿边界。
  - Events 基础闭环已覆盖 list、detail、registration、ticket、admin create/update/review/checkin。
  - Discover 基础闭环已覆盖 feed、detail、create、comment、report、admin moderation。
  - Files 基础流已覆盖 upload request、complete、private url。
  - Auth、announcements、notifications 有最低可用接口。
  - 6.19-6.21 local/API readiness 已覆盖 events、discover、files、notifications、auth/role 的关键负路径和 CloudBase handler fallback parity。
- 未完善 / 不应宣称线上完成：
  - 非 places CloudBase live providers 尚未完成。
  - CloudBase dev places live acceptance 已完成非图集闭环；gallery media 和非 places live providers 尚未完成。
  - 线上 `/api` route、prod env、生产数据库权限规则尚未完成验收。
  - CloudBase MCP 未重新登录和 live smoke test 前，不能把微信云数据库标记为“已验证可连接”。

使用建议：

- 其他模块开发者可以基于本文档进行本地 HTTP 联调。
- 上线前必须等待 CloudBase live 验收结论；不要把本地 mock 通过等同于生产可用。

## 2. 通用约定

### 2.1 Base URL

本地 API：

```text
http://127.0.0.1:8787
```

健康检查：

```bash
curl http://127.0.0.1:8787/health
```

### 2.2 请求头

本地 mock actor 通过 `x-mock-user-id` 传递：

```text
x-mock-user-id: user_001
content-type: application/json
```

常用 mock user：

- `user_001`：通常用于 admin / 默认测试用户。
- `user_002`：通常用于普通用户或权限负路径测试。
- `user_inactive`：inactive actor，和未知 actor 一样应返回 `401`。

具体角色以 `packages/shared/src/mock/data.ts` 为准。

### 2.3 响应 envelope

成功：

```json
{
  "success": true,
  "data": {},
  "requestId": "req_xxx"
}
```

失败：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "details": {}
  },
  "requestId": "req_xxx"
}
```

常见错误：

| HTTP 状态 | code | 含义 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 请求 query/body 不符合 schema |
| `401` | `UNAUTHORIZED` | 未登录或 actor 无法解析 |
| `403` | `FORBIDDEN` | 权限不足 |
| `404` | `NOT_FOUND` | 资源不存在或不可见 |
| `409` | `CONFLICT` | 重复报名、容量满、报名关闭、票据状态冲突等业务冲突 |

### 2.4 管理端权限

以下路径需要 `community_admin` 或 `system_admin`：

- `/admin/events`
- `/admin/events/:id`
- `/admin/events/:id/review`
- `/admin/events/:id/checkin`
- `/admin/discover/posts/:id/moderation`
- `/admin/places`
- `/admin/places/:id`
- protected file paths 的 `/files/upload-requests`
- protected file paths 的 `/files/complete`

Protected file paths / business types:

- `public/places/` / `place_gallery`
- `private/tickets/` / `event_ticket` 或 `ticket`
- `private/exports/` / `export`
- `private/admin/` / `admin_file`

### 2.5 运行模式

| 模式 | 说明 |
| --- | --- |
| `mock` | 默认模式，主要用于本地开发；数据在 mock service 中。 |
| `http` | 前端通过 HTTP 访问本地 Koa API。 |
| `cloudbase-function` | 小程序通过 `wx.cloud.callHTTPFunction` 或 fallback cloud function 调用 API。 |
| CloudBase live provider | 当前只覆盖 places live 路径；需要 `API_PROVIDER=cloudbase`、`CLOUDBASE_PROVIDER_MODE=live`、`CLOUDBASE_ENV_ID` 或 `TCB_ENV`。 |

注意：events、discover、comments、files、notifications、auth/role 当前只完成 local/API readiness 和 CloudBase handler fallback parity；非 places live provider persistence 尚未验收。

## 3. 快速启动

启动 API：

```bash
pnpm dev:api
```

Admin HTTP 联调：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev
```

Mobile H5 HTTP 联调：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5
```

微信小程序 CloudBase function 模式：

```bash
VITE_API_MODE=cloudbase-function \
VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 \
VITE_CLOUDBASE_FUNCTION_NAME=community-map-api \
pnpm --filter @community-map/mobile dev:mp-weixin
```

## 4. 数据类型速查

### 4.1 通用分页

Query：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 从 1 开始 |
| `pageSize` | number | `10` | 最大 50 |
| `communityId` | string | `tongzilin` | 当前默认社区 |
| `keyword` | string | optional | 关键词 |

分页响应：

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

### 4.2 坐标

```json
{
  "latitude": 30.615,
  "longitude": 104.062
}
```

### 4.3 语言和权限

| 类型 | 当前值 |
| --- | --- |
| locale | `zh`, `en` |
| role_flags | `community_admin`, `system_admin` 等，详见 shared enums |
| file visibility | `public`, `private` |

## 5. System

### GET `/health`

用途：服务健康检查。

权限：无。

响应 data：

```json
{
  "ok": true
}
```

示例：

```bash
curl http://127.0.0.1:8787/health
```

## 6. Auth

### POST `/auth/login`

用途：模拟登录并返回 session。

权限：无。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 否 | 预留登录 code |
| `mock_user_id` | string | 否 | mock 用户 ID |
| `preferred_language` | `zh` / `en` | 否 | 偏好语言 |

响应 data：`AuthSession`

```json
{
  "user": {
    "_id": "user_001",
    "nickname": "Admin",
    "avatar_url": "https://example.com/avatar.png",
    "preferred_language": "zh",
    "role_flags": ["community_admin"],
    "status": "active"
  },
  "token": "mock-token"
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/auth/login \
  -H 'content-type: application/json' \
  -d '{"mock_user_id":"user_001","preferred_language":"zh"}'
```

### GET `/auth/me`

用途：获取当前用户会话信息。

权限：需要可解析 actor；本地通过 `x-mock-user-id`。

响应 data：`User`

示例：

```bash
curl http://127.0.0.1:8787/auth/me \
  -H 'x-mock-user-id: user_001'
```

## 7. Events

### GET `/events`

用途：获取活动列表。

权限：无。

Query：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID |
| `keyword` | string | optional | 标题/内容关键词 |

响应 data：分页 `Event[]`

关键 Event 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 活动 ID |
| `title_zh` / `title_en` | string | 双语标题 |
| `summary_zh` / `summary_en` | string | 双语摘要 |
| `content_zh` / `content_en` | string | 双语正文 |
| `cover_url` | URL string | 封面图 |
| `place_id` | string | 可选地点 ID |
| `address_text` | string | 地址文本 |
| `location` | Coordinates | 经纬度 |
| `start_time` / `end_time` | string | 时间 |
| `signup_deadline` | string | 报名截止 |
| `capacity` | number | 容量 |
| `review_status` | string | 审核状态 |
| `publish_status` | string | 发布状态 |

示例：

```bash
curl 'http://127.0.0.1:8787/events?page=1&pageSize=10&communityId=tongzilin'
```

### GET `/events/:id`

用途：获取活动详情。

权限：无。

Path params：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 活动 ID |

响应 data：`Event`

关键错误：

- `404 NOT_FOUND`：活动不存在。

示例：

```bash
curl http://127.0.0.1:8787/events/event_001
```

### POST `/events/:id/registrations`

用途：创建活动报名并生成票据。

权限：需要当前 actor。

Body：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `contact_name` | string | 是 | - | 联系人 |
| `contact_phone` | string | 是 | - | 联系电话，至少 6 位 |
| `attendee_count` | number | 是 | - | 参与人数，1-10 |
| `source_channel` | string | 否 | `miniapp` | 来源 |

响应 data：

```json
{
  "registration": {
    "_id": "registration_001",
    "event_id": "event_001",
    "user_id": "user_001",
    "contact_name": "Jerry",
    "contact_phone": "13800000000",
    "attendee_count": 1,
    "registration_status": "registered",
    "ticket_id": "ticket_001",
    "source_channel": "miniapp"
  },
  "ticket": {
    "_id": "ticket_001",
    "registration_id": "registration_001",
    "ticket_code": "ABC123",
    "qr_file_id": "cloud://...",
    "qr_cloud_path": "private/tickets/registration_001/qr.png",
    "visibility": "private",
    "status": "issued",
    "issued_at": "2026-06-16T00:00:00.000Z",
    "used_at": null
  }
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/events/event_001/registrations \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"contact_name":"Jerry","contact_phone":"13800000000","attendee_count":1}'
```

### GET `/events/me/registrations`

用途：获取当前用户报名记录。

权限：需要当前 actor。

响应 data：`EventRegistration[]` 或分页/列表结构，以当前 provider 返回为准。

示例：

```bash
curl http://127.0.0.1:8787/events/me/registrations \
  -H 'x-mock-user-id: user_001'
```

### GET `/events/registrations/:id/ticket`

用途：获取报名票据。

权限：需要当前 actor。

Path params：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | registration ID |

响应 data：`EventTicket`

示例：

```bash
curl http://127.0.0.1:8787/events/registrations/registration_001/ticket \
  -H 'x-mock-user-id: user_001'
```

### POST `/admin/events`

用途：管理端创建活动。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title_zh` / `title_en` | string | 是 | 双语标题 |
| `summary_zh` / `summary_en` | string | 是 | 双语摘要 |
| `content_zh` / `content_en` | string | 是 | 双语正文 |
| `address_text` | string | 是 | 地址文本 |
| `location` | Coordinates | 是 | 经纬度 |
| `start_time` / `end_time` | string | 是 | 活动时间 |
| `signup_deadline` | string | 是 | 报名截止 |
| `capacity` | number | 是 | 正整数 |
| `place_id` | string | 否 | 关联地点 |
| `cover_file_id` | string | 否 | 封面文件 ID |
| `cover_cloud_path` | string | 否 | 封面 cloud path |
| `cover_url` | URL string | 否 | 封面 URL |

响应 data：`Event`

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{
    "title_zh":"社区活动",
    "title_en":"Community Event",
    "summary_zh":"活动摘要",
    "summary_en":"Event summary",
    "content_zh":"活动内容",
    "content_en":"Event content",
    "address_text":"Tongzilin",
    "location":{"latitude":30.615,"longitude":104.062},
    "start_time":"2026-06-20T10:00:00.000Z",
    "end_time":"2026-06-20T12:00:00.000Z",
    "signup_deadline":"2026-06-19T12:00:00.000Z",
    "capacity":20
  }'
```

### PATCH `/admin/events/:id`

用途：管理端更新活动。

权限：`community_admin` 或 `system_admin`。

Body：`POST /admin/events` body 的任意子集。

响应 data：`Event`

示例：

```bash
curl -X PATCH http://127.0.0.1:8787/admin/events/event_001 \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"capacity":30}'
```

### POST `/admin/events/:id/review`

用途：管理端审核活动。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_status` | `approved` / `rejected` / `pending_review` | 是 | 审核状态 |
| `publish_status` | `draft` / `published` / `offline` | 否 | 发布状态 |
| `reason` | string | 否 | 审核原因 |

响应 data：`Event`

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/event_001/review \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"review_status":"approved","publish_status":"published"}'
```

### POST `/admin/events/:id/checkin`

用途：管理端核销活动票据。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ticket_id` | string | 是 | 票据 ID |
| `note` | string | 否 | 核销备注 |

响应 data：`EventTicket`

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/event_001/checkin \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"ticket_id":"ticket_001","note":"front desk"}'
```

## 8. Discover

### GET `/discover/posts`

用途：获取社区内容流。

权限：无。

Query：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID |
| `keyword` | string | optional | 关键词 |

响应 data：分页 `Post[]`

Post 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 帖子 ID |
| `author_user_id` | string | 作者 |
| `community_id` | string | 社区 |
| `title` | string | 标题 |
| `content` | string | 内容 |
| `language` | `zh` / `en` | 语言 |
| `tag_ids` | string[] | 标签 |
| `location_text` | string/null | 位置文本 |
| `image_file_ids` | string[] | 图片文件 ID |
| `image_urls` | URL[] | 图片 URL |
| `status` | string | 内容状态 |
| `review_status` | string | 审核状态 |

示例：

```bash
curl 'http://127.0.0.1:8787/discover/posts?page=1&pageSize=10'
```

### GET `/discover/posts/:id`

用途：获取帖子详情。

权限：无。

响应 data：`Post`

示例：

```bash
curl http://127.0.0.1:8787/discover/posts/post_001
```

### POST `/discover/posts`

用途：创建帖子。

权限：需要当前 actor。

Body：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string | 是 | - | 标题 |
| `content` | string | 是 | - | 内容 |
| `language` | `zh` / `en` | 是 | - | 语言 |
| `tag_ids` | string[] | 是 | - | 标签 |
| `location_text` | string/null | 否 | `null` | 位置 |
| `image_file_ids` | string[] | 否 | `[]` | 图片文件 ID |
| `image_urls` | URL[] | 否 | `[]` | 图片 URL |

响应 data：`Post`

示例：

```bash
curl -X POST http://127.0.0.1:8787/discover/posts \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"title":"Hello","content":"Welcome","language":"en","tag_ids":["intro"]}'
```

### POST `/discover/posts/:id/comments`

用途：发表评论。

权限：需要当前 actor。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | string | 是 | 评论内容 |
| `language` | `zh` / `en` | 是 | 语言 |

响应 data：`Comment`

示例：

```bash
curl -X POST http://127.0.0.1:8787/discover/posts/post_001/comments \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"content":"Looks good","language":"en"}'
```

### POST `/discover/posts/:id/report`

用途：举报帖子。

权限：需要当前 actor。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reason` | string | 是 | 举报原因 |
| `description` | string | 否 | 补充描述 |

响应 data：`Post`

示例：

```bash
curl -X POST http://127.0.0.1:8787/discover/posts/post_001/report \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"reason":"spam","description":"Repeated content"}'
```

### POST `/admin/discover/posts/:id/moderation`

用途：管理端审核/治理帖子。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_status` | `visible` / `hidden` / `deleted` | 是 | 处理结果 |
| `reason` | string | 否 | 原因 |

响应 data：`Post`

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/discover/posts/post_001/moderation \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"review_status":"hidden","reason":"spam"}'
```

## 9. Places

### 9.1 字段边界

- `GET /places` 是 public list v1，只返回卡片字段和分页信息，不返回详情重字段。
- `GET /places/map-markers` 只返回 marker-safe 字段，不返回完整地址、图集、导航等详情字段。
- `GET /places/:id` 返回详情字段，包括 `gallery_media`、派生兼容字段 `gallery_urls`、`navigation`、`share`。
- `GET /admin/places` 返回 canonical/admin place，可见 `import_review`；public payload 不返回 `import_review` 或志愿者原始证据。
- public places 只应展示 `status=published` 且属于目标 `communityId` 的地点。

### GET `/places`

用途：获取 public 地点列表。

权限：无。

Query：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID |
| `keyword` | string | optional | 关键词 |
| `category` | string | optional | 一级或二级分类 |
| `tag` | string | optional | 标签 ID |
| `recommended` | boolean | optional | 是否只看推荐 |
| `sort` | `recommended` / `name` | `recommended` | 排序 |

响应 data：分页 `PlaceListItem[]`

PlaceListItem 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 地点 ID |
| `name_zh` / `name_en` | string | 双语名称 |
| `cover_url` | URL/null | 封面 |
| `category_level_1` / `category_level_2` | string | 分类 |
| `short_address_zh` / `short_address_en` | string | 短地址 |
| `summary_zh` / `summary_en` | string | 摘要 |
| `tag_ids` | string[] | 标签 |
| `is_recommended` | boolean | 是否推荐 |
| `recommended_reason_zh` / `recommended_reason_en` | string/null | 推荐理由 |
| `supports_navigation` | boolean | 是否支持导航 |

示例：

```bash
curl 'http://127.0.0.1:8787/places?communityId=tongzilin&recommended=true&sort=recommended&page=1&pageSize=10'
```

关键错误：

- `400 VALIDATION_ERROR`：例如 `sort=latest`。

### GET `/places/map-markers`

用途：获取 public 地图 marker。

权限：无。

响应 data：`PlaceMapMarker[]`

Marker 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 地点 ID |
| `name_zh` / `name_en` | string | 名称 |
| `category_level_1` | string | 一级分类 |
| `is_recommended` | boolean | 是否推荐 |
| `location` | Coordinates | 经纬度 |

示例：

```bash
curl http://127.0.0.1:8787/places/map-markers
```

### GET `/places/:id`

用途：获取 public 地点详情。

权限：无。

响应 data：`PlaceDetail`

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 地点 ID |
| `community_id` | string | 社区 |
| `name_zh` / `name_en` | string | 名称 |
| `cover_url` | URL/null | 封面 |
| `category_level_1` / `category_level_2` | string | 分类 |
| `tag_ids` | string[] | 标签 |
| `address_zh` / `address_en` | string | 完整地址 |
| `location` | Coordinates | 经纬度 |
| `business_hours_zh` / `business_hours_en` | string | 营业时间 |
| `intro_zh` / `intro_en` | string | 简介 |
| `gallery_media` | PlaceGalleryMedia[] | 主图集字段 |
| `gallery_urls` | URL[] | 由 `gallery_media.url` 派生的兼容字段 |
| `is_recommended` | boolean | 是否推荐 |
| `supports_navigation` | boolean | 是否支持导航 |
| `supports_favorite` | boolean | 是否支持收藏 |
| `supports_share` | boolean | 是否支持分享 |
| `navigation` | object | 导航信息 |
| `share` | object | 分享信息 |

`gallery_media`：

```json
{
  "file_id": "cloud://...",
  "cloud_path": "public/places/place_001/a.jpg",
  "url": "https://example.com/a.jpg",
  "alt_zh": "图集 1",
  "alt_en": "gallery 1"
}
```

示例：

```bash
curl http://127.0.0.1:8787/places/place_001
```

### GET `/admin/places`

用途：管理端地点列表，包含 draft/offline/published 和 admin-only 字段。

权限：`community_admin` 或 `system_admin`。

响应 data：分页 `Place[]`

示例：

```bash
curl http://127.0.0.1:8787/admin/places \
  -H 'x-mock-user-id: user_001'
```

### POST `/admin/places`

用途：管理端新建地点。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `name_zh` / `name_en` | string | 是 | - | 双语名称 |
| `category_level_1` | string | 是 | - | 一级分类 |
| `category_level_2` | string | 是 | - | 二级分类 |
| `address_zh` / `address_en` | string | 是 | - | 地址 |
| `location` | Coordinates | 是 | - | 经纬度 |
| `business_hours_zh` / `business_hours_en` | string | 是 | - | 营业时间 |
| `intro_zh` / `intro_en` | string | 是 | - | 简介 |
| `cover_file_id` | string/null | 否 | `null` | 封面文件 ID |
| `cover_url` | URL/null | 否 | `null` | 封面 URL |
| `tag_ids` | string[] | 否 | `[]` | 标签 |
| `recommended_reason_zh` / `recommended_reason_en` | string/null | 否 | `null` | 推荐理由 |
| `is_recommended` | boolean | 否 | `false` | 是否推荐 |
| `recommended_rank` | number | 否 | `0` | 推荐排序 |
| `gallery_file_ids` | string[] | 否 | `[]` | 图集文件 ID |
| `gallery_urls` | URL[] | 否 | `[]` | 兼容图集 URL |
| `tencent_map_poi_id` | string/null | 否 | `null` | 腾讯地图 POI |
| `supports_navigation` | boolean | 否 | `true` | 支持导航 |
| `supports_favorite` | boolean | 否 | `true` | 支持收藏 |
| `supports_share` | boolean | 否 | `true` | 支持分享 |
| `status` | `draft` / `published` / `offline` | 否 | `draft` | 发布状态 |
| `import_review` | object/null | 否 | `null` | 志愿者导入审核元数据 |

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/places \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{
    "name_zh":"社区服务中心",
    "name_en":"Community Service Center",
    "category_level_1":"public-service",
    "category_level_2":"service-center",
    "address_zh":"桐梓林",
    "address_en":"Tongzilin",
    "location":{"latitude":30.615,"longitude":104.062},
    "business_hours_zh":"周一至周五 09:00-18:00",
    "business_hours_en":"Mon-Fri 09:00-18:00",
    "intro_zh":"社区服务介绍",
    "intro_en":"Community service introduction",
    "status":"published"
  }'
```

### PATCH `/admin/places/:id`

用途：管理端更新地点。

权限：`community_admin` 或 `system_admin`。

Body：`POST /admin/places` body 的任意子集。

响应 data：`Place`

示例：

```bash
curl -X PATCH http://127.0.0.1:8787/admin/places/place_001 \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"is_recommended":true,"recommended_rank":1}'
```

## 10. Announcements

### GET `/announcements`

用途：获取公告列表。

权限：无。

Query：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID |

响应 data：分页 `Announcement[]`

Announcement 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 公告 ID |
| `community_id` | string | 社区 |
| `title_zh` / `title_en` | string | 标题 |
| `summary_zh` / `summary_en` | string | 摘要 |
| `content_zh` / `content_en` | string | 正文 |
| `cover_file_id` | string | 封面文件 ID |
| `cover_url` | URL | 封面 URL |
| `status` | string | 状态 |
| `published_at` | string | 发布时间 |

示例：

```bash
curl 'http://127.0.0.1:8787/announcements?page=1&pageSize=10'
```

### GET `/announcements/:id`

用途：获取公告详情。

权限：无。

响应 data：`Announcement`

示例：

```bash
curl http://127.0.0.1:8787/announcements/announcement_001
```

## 11. Notifications

### GET `/notifications`

用途：获取当前用户通知列表。

权限：需要当前 actor。

响应 data：`Notification[]`

Notification 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 通知 ID |
| `user_id` | string | 用户 ID |
| `title` | string | 标题 |
| `body` | string | 内容 |
| `status` | string | 状态 |
| `created_at` | string | 创建时间 |

示例：

```bash
curl http://127.0.0.1:8787/notifications \
  -H 'x-mock-user-id: user_001'
```

### POST `/notifications/:id/read`

用途：标记通知为已读。

权限：需要当前 actor。

Body：空对象 `{}`。

响应 data：`Notification`

示例：

```bash
curl -X POST http://127.0.0.1:8787/notifications/notification_001/read \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{}'
```

## 12. Files

### 12.1 路径规则

| 常量 | prefix | 用途 |
| --- | --- | --- |
| `eventCovers` | `public/events/` | 活动封面 |
| `placeGallery` | `public/places/` | 地点图集 |
| `postImages` | `public/posts/` | 帖子图片 |
| `announcementImages` | `public/announcements/` | 公告图片 |
| `tickets` | `private/tickets/` | 票券二维码 |
| `exports` | `private/exports/` | 导出文件 |
| `admin` | `private/admin/` | 后台私有文件 |

权限规则：

- `place_gallery` 或 `target_prefix=public/places/` 的 upload request 需要 admin。
- `place_gallery` 或 `cloud_path` 以 `public/places/` 开头的 complete 需要 admin。
- private 文件必须通过 `/files/private-url` 获取临时访问地址。

### POST `/files/upload-requests`

用途：创建上传请求，返回上传地址和 cloud path。

权限：

- 普通文件：需要当前 actor。
- place gallery：需要 `community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `biz_type` | string | 是 | 业务类型，如 `place_gallery`、`event_cover` |
| `biz_id` | string | 是 | 业务 ID |
| `file_name` | string | 是 | 文件名 |
| `visibility` | `public` / `private` | 是 | 可见性 |
| `target_prefix` | enum | 是 | 必须是上表 prefix 之一 |

响应 data：

```json
{
  "cloud_path": "public/places/place_001/a.jpg",
  "upload_url": "https://example.com/upload",
  "expires_in": 600
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/files/upload-requests \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{
    "biz_type":"place_gallery",
    "biz_id":"place_001",
    "file_name":"a.jpg",
    "visibility":"public",
    "target_prefix":"public/places/"
  }'
```

### POST `/files/complete`

用途：上传完成后登记文件资产。

权限：

- 普通文件：需要当前 actor。
- place gallery：需要 `community_admin` 或 `system_admin`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `biz_type` | string | 是 | 业务类型 |
| `biz_id` | string | 是 | 业务 ID |
| `file_id` | string | 是 | 云文件 ID |
| `cloud_path` | string | 是 | cloud path |
| `visibility` | `public` / `private` | 是 | 可见性 |

响应 data：`FileAsset`

FileAsset 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文件资产 ID |
| `file_id` | string | 云文件 ID |
| `cloud_path` | string | cloud path |
| `visibility` | `public` / `private` | 可见性 |
| `biz_type` | string | 业务类型 |
| `biz_id` | string | 业务 ID |
| `uploaded_by` | string | 上传用户 |
| `status` | string | 状态 |

示例：

```bash
curl -X POST http://127.0.0.1:8787/files/complete \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{
    "biz_type":"place_gallery",
    "biz_id":"place_001",
    "file_id":"cloud://cloud1/public/places/place_001/a.jpg",
    "cloud_path":"public/places/place_001/a.jpg",
    "visibility":"public"
  }'
```

### POST `/files/private-url`

用途：获取私有文件临时访问地址。

权限：需要当前 actor；具体文件权限仍需 provider 校验。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file_id` | string | 是 | 云文件 ID |

响应 data：

```json
{
  "temp_url": "https://example.com/temp",
  "expires_at": "2026-06-16T12:00:00.000Z"
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/files/private-url \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"file_id":"cloud://cloud1/private/tickets/registration_001/qr.png"}'
```

## 13. 管理后台接口汇总

| 模块 | 方法 | 路径 | 权限 | 用途 |
| --- | --- | --- | --- | --- |
| Events | `POST` | `/admin/events` | admin | 创建活动 |
| Events | `PATCH` | `/admin/events/:id` | admin | 更新活动 |
| Events | `POST` | `/admin/events/:id/review` | admin | 审核活动 |
| Events | `POST` | `/admin/events/:id/checkin` | admin | 核销票据 |
| Discover | `POST` | `/admin/discover/posts/:id/moderation` | admin | 审核/治理帖子 |
| Places | `GET` | `/admin/places` | admin | 地点列表 |
| Places | `POST` | `/admin/places` | admin | 创建地点 |
| Places | `PATCH` | `/admin/places/:id` | admin | 更新地点 |
| Files | `POST` | `/files/upload-requests` | conditional | 创建上传请求 |
| Files | `POST` | `/files/complete` | conditional | 完成文件登记 |
| Files | `POST` | `/files/private-url` | actor | 获取私有文件临时地址 |

`conditional` 表示普通文件需要 actor，place gallery 需要 admin。

## 14. 前端调用建议

- 优先使用 `packages/shared/src/client.ts` 暴露的 client 方法，不要在 app 内手写路径字符串。
- Admin 和 Mobile 都应通过统一 API contract 访问业务数据，不绕过 BFF 直连核心业务数据库。
- 新增接口时必须同步：
  1. `packages/shared/src/schemas/*`
  2. `packages/shared/src/contracts/*`
  3. `packages/shared/src/contracts/paths.ts`
  4. `apps/api/src/routes/*`
  5. `apps/api/src/providers/*`
  6. `packages/shared/src/client.ts`
  7. 本文档或 `docs/已实现API接口清单.md`

## 15. 上线前必须重新确认

- CloudBase MCP 登录状态。
- `community-map-api` 是否已部署为正式 HTTP function。
- `/api` route 是否已创建并可访问。
- CloudBase dev live acceptance 是否通过。
- 非 places live providers 是否完成或明确降级。
- Prod env、数据库安全规则、存储权限、admin hosting、日志检索是否通过验收。
