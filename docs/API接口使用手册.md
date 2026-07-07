# API 接口使用手册

更新时间：2026-06-29
适用对象：Mobile、小程序、Admin、events、discover、places、files、notifications 等模块开发者
事实来源：`packages/shared/src/contracts/*`、`packages/shared/src/schemas/*`、`apps/api/src/routes/*`、`docs/已实现API接口清单.md`

## 1. 当前完善度结论

当前 API 已经可以支撑本地 mock / HTTP 联调和主要模块开发：

- 已完善：
  - 本地 Koa HTTP route 注册完整。
  - Shared contract / schema 覆盖当前已实现接口。
  - Places 主链路已覆盖 list、map markers、detail、admin list/create/update/delete、gallery metadata、志愿者导入草稿边界。
  - Events 基础闭环已覆盖 list、detail、registration、ticket、admin create/update/review/checkin。
  - Discover 基础闭环已覆盖 feed、detail、create、comment、report、admin moderation。
  - Files 基础流已覆盖 upload request、complete、private url。
  - Auth、announcements、notifications 有最低可用接口。
  - 6.19-6.21 local/API readiness 已覆盖 events、discover、files、notifications、auth/role 的关键负路径和 CloudBase handler fallback parity。
- 未完善 / 不应宣称线上完成：
  - 非 places CloudBase live providers 尚未完成。
  - CloudBase dev places live acceptance 已覆盖 public list、map、detail、admin update/delete、draft visibility 和真实 storage gallery media temp URL；非 places live providers 尚未完成。
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

| HTTP 状态 | code               | 含义                                               |
| --------- | ------------------ | -------------------------------------------------- |
| `400`     | `VALIDATION_ERROR` | 请求 query/body 不符合 schema                      |
| `401`     | `UNAUTHORIZED`     | 未登录或 actor 无法解析                            |
| `403`     | `FORBIDDEN`        | 权限不足                                           |
| `404`     | `NOT_FOUND`        | 资源不存在或不可见                                 |
| `409`     | `CONFLICT`         | 重复报名、容量满、报名关闭、票据状态冲突等业务冲突 |

### 2.4 管理端权限

以下路径需要 `community_admin` 或 `system_admin`：

- `/admin/events`
- `/admin/events/:id`
- `/admin/events/:id/review`
- `/admin/events/:id/registrations`
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

| 模式                    | 说明                                                                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mock`                  | 默认模式，主要用于本地开发；数据在 mock service 中。                                                                                                                              |
| `http`                  | 前端通过 HTTP 访问本地 Koa API。                                                                                                                                                  |
| `cloudbase-function`    | 小程序通过 `wx.cloud.callHTTPFunction` 或 fallback cloud function 调用 API。                                                                                                      |
| CloudBase live provider | 当前覆盖 places、events、discover core posts/comments 和通用 files 完成记录路径；需要 `API_PROVIDER=cloudbase`、`CLOUDBASE_PROVIDER_MODE=live`、`CLOUDBASE_ENV_ID` 或 `TCB_ENV`。 |

注意：discover core live provider 已有代码路径，但仍需 CloudBase dev/prod 集合、索引、安全规则和在线 smoke 证据后才能声明生产数据 readiness；notifications、auth/role 仍以 fallback parity 为主。

Admin 地点与活动地址搜索由 API 端代理调用腾讯位置服务 WebServiceAPI：

- `TENCENT_MAP_KEY`：必填，腾讯位置服务 Key。
- `TENCENT_MAP_SECRET_KEY`：可选，开启 SN 校验后填写 SecretKey/SK，API 会在服务端生成 `sig`。
- 不要把腾讯地图 key 配成 Admin 前端 `VITE_` 变量；静态站点包会暴露这类变量。
- CloudBase `community-map-api` 函数配置 key 时，保留现有 `API_PROVIDER=cloudbase`、`CLOUDBASE_PROVIDER_MODE=live`、`CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`。

Admin 地点 Amap 图片候选搜索同样由 API 端代理：

- `AMAP_WEB_SERVICE_KEY`：必填，Amap WebService Key，仅配置在 API/CloudBase 函数环境。
- Amap 图片仅作为外部来源引用保存到 `external_gallery_media` 或 `cover_source`；本系统不下载、代理、缓存、转码或重新上传 Amap 图片。
- Mobile 详情展示外部图片时必须显示来源归因；自有上传图片继续通过 `gallery_file_ids` / `gallery_media` 表达。

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

| 字段          | 类型   | 默认值      | 说明         |
| ------------- | ------ | ----------- | ------------ |
| `page`        | number | `1`         | 从 1 开始    |
| `pageSize`    | number | `10`        | 最大 50      |
| `communityId` | string | `tongzilin` | 当前默认社区 |
| `keyword`     | string | optional    | 关键词       |

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

| 类型            | 当前值                                                  |
| --------------- | ------------------------------------------------------- |
| locale          | `zh`, `en`                                              |
| role_flags      | `community_admin`, `system_admin` 等，详见 shared enums |
| file visibility | `public`, `private`                                     |

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

| 字段                 | 类型        | 必填 | 说明          |
| -------------------- | ----------- | ---- | ------------- |
| `code`               | string      | 否   | 预留登录 code |
| `mock_user_id`       | string      | 否   | mock 用户 ID  |
| `preferred_language` | `zh` / `en` | 否   | 偏好语言      |

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

| 字段          | 类型   | 默认值      | 说明              |
| ------------- | ------ | ----------- | ----------------- |
| `page`        | number | `1`         | 页码              |
| `pageSize`    | number | `10`        | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID           |
| `keyword`     | string | optional    | 标题/内容关键词   |

响应 data：分页 `Event[]`

关键 Event 字段：

| 字段                        | 类型        | 说明        |
| --------------------------- | ----------- | ----------- |
| `_id`                       | string      | 活动 ID     |
| `title_zh` / `title_en`     | string      | 双语标题    |
| `summary_zh` / `summary_en` | string      | 双语摘要    |
| `content_zh` / `content_en` | string      | 双语正文    |
| `cover_url`                 | URL string  | 封面图      |
| `place_id`                  | string      | 可选地点 ID |
| `address_text`              | string      | 地址文本    |
| `location`                  | Coordinates | 经纬度      |
| `start_time` / `end_time`   | string      | 时间        |
| `signup_deadline`           | string      | 报名截止    |
| `capacity`                  | number      | 容量        |
| `review_status`             | string      | 审核状态    |
| `publish_status`            | string      | 发布状态    |

示例：

```bash
curl 'http://127.0.0.1:8787/events?page=1&pageSize=10&communityId=tongzilin'
```

### GET `/events/:id`

用途：获取活动详情。

权限：无。

Path params：

| 字段 | 类型   | 说明    |
| ---- | ------ | ------- |
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

| 字段             | 类型   | 必填 | 默认值    | 说明                |
| ---------------- | ------ | ---- | --------- | ------------------- |
| `contact_name`   | string | 是   | -         | 联系人              |
| `contact_phone`  | string | 是   | -         | 联系电话，至少 6 位 |
| `attendee_count` | number | 是   | -         | 参与人数，1-10      |
| `source_channel` | string | 否   | `miniapp` | 来源                |

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
    "registration_status": "confirmed",
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
    "status": "valid",
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

| 字段 | 类型   | 说明            |
| ---- | ------ | --------------- |
| `id` | string | registration ID |

响应 data：`EventTicket`

示例：

```bash
curl http://127.0.0.1:8787/events/registrations/registration_001/ticket \
  -H 'x-mock-user-id: user_001'
```

### GET `/admin/events`

用途：管理端获取活动列表，包含公开端不可见的草稿、待审核、已下线和已结束记录。

权限：`community_admin` 或 `system_admin`。

响应 data：分页 `EventAdminListItem[]`

在标准 `Event` 字段外，每个 item 额外包含：

| 字段                        | 类型    | 说明                                   |
| --------------------------- | ------- | -------------------------------------- |
| `active_registration_count` | number  | 未取消/未关闭的报名笔数                |
| `confirmed_attendee_count`  | number  | 未取消/未关闭报名的总参与人数          |
| `remaining_capacity`        | number  | 剩余名额，最低为 0                     |
| `is_full`                   | boolean | `remaining_capacity === 0` 时为 `true` |

常见错误：

- `401 UNAUTHORIZED`：actor 无法解析。
- `403 FORBIDDEN`：actor 不是 `community_admin` 或 `system_admin`。

示例：

```bash
curl http://127.0.0.1:8787/admin/events \
  -H 'x-mock-user-id: user_001'
```

### POST `/admin/events`

用途：管理端创建活动。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段                        | 类型        | 必填 | 说明                                                                                                      |
| --------------------------- | ----------- | ---- | --------------------------------------------------------------------------------------------------------- |
| `title_zh` / `title_en`     | string      | 是   | 双语标题                                                                                                  |
| `summary_zh` / `summary_en` | string      | 是   | 双语摘要                                                                                                  |
| `content_zh` / `content_en` | string      | 是   | 双语正文                                                                                                  |
| `address_text`              | string      | 是   | 地址文本                                                                                                  |
| `location`                  | Coordinates | 是   | 经纬度                                                                                                    |
| `start_time` / `end_time`   | string      | 是   | 活动时间                                                                                                  |
| `signup_deadline`           | string      | 是   | 报名截止                                                                                                  |
| `capacity`                  | number      | 是   | 正整数                                                                                                    |
| `place_id`                  | string      | 否   | 关联地点                                                                                                  |
| `cover_file_id`             | string/null | 否   | 封面文件 ID；本地上传、复用地点自有图集或地点托管封面时提交，外部 URL-only 封面提交 `null`                |
| `cover_cloud_path`          | string/null | 否   | 封面 cloud path；本地上传或复用地点自有图集时提交，地点托管封面可为 `null`，外部 URL-only 封面提交 `null` |
| `cover_url`                 | URL string  | 否   | 封面 URL；可来自本地上传、地点封面、地点自有图集当前 URL 或 Amap 外部图片 URL                             |

响应 data：`Event`

说明：创建接口默认产生后台可见草稿；如需公开端可见，应随后调用 `POST /admin/events/:id/review` 设置 `review_status="approved"` 且 `publish_status="published"`。Admin 后台运营表单不要求手填封面 file id、cloud path 或 URL，可通过 `POST /admin/events/cover-file` 或 `POST /admin/events/:id/cover-file` 直接上传本地图片后，把响应中的封面字段随创建或保存提交。也可复用已发布地点图片：选择地点自有图集时提交该图片的 `file_id`、`cloud_path` 和当前 URL；选择地点托管封面时提交地点的 `cover_file_id` 和当前 URL，`cover_cloud_path` 可为 `null`；选择 Amap 外部图等外部 URL-only 图片时仅提交 `cover_url`，并将 `cover_file_id` / `cover_cloud_path` 置为 `null`。

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
    "start_time":"2027-06-20T10:00:00+08:00",
    "end_time":"2027-06-20T12:00:00+08:00",
    "signup_deadline":"2027-06-19T12:00:00+08:00",
    "capacity":20
  }'
```

### POST `/admin/events/cover-file`

用途：管理端在创建活动前直接上传本地活动封面。成功后后端创建 completed active `FileAsset`，先以 pending 归属记录；创建活动时提交返回的 `cover_file_id`、`cover_cloud_path`、`cover_url` 后会绑定到新活动。上传响应中的 `cover_file_id` / `cover_cloud_path` 始终为字符串；只有复用外部 URL-only 封面时才提交 `null`。

权限：`community_admin` 或 `system_admin`。

请求：`multipart/form-data`

| 字段   | 类型 | 必填 | 说明                                                                     |
| ------ | ---- | ---- | ------------------------------------------------------------------------ |
| `file` | file | 是   | 支持 `image/jpeg`、`image/png`、`image/webp`、`image/gif`，当前上限 5 MB |

响应 data：

```json
{
  "file_asset": {
    "_id": "file_001",
    "file_id": "cloud://...",
    "cloud_path": "public/events/_pending/upload/cover.jpg",
    "visibility": "public",
    "biz_type": "event_cover",
    "biz_id": "__pending_event_cover__",
    "uploaded_by": "user_001",
    "status": "active"
  },
  "cover_file_id": "cloud://...",
  "cover_cloud_path": "public/events/_pending/upload/cover.jpg",
  "cover_url": "https://example.com/public/events/_pending/upload/cover.jpg"
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/cover-file \
  -H 'x-mock-user-id: user_001' \
  -F 'file=@./cover.jpg;type=image/jpeg'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少文件、文件类型不支持或文件超过大小限制。
- `403 FORBIDDEN`：actor 不是 `community_admin` / `system_admin`。

### POST `/admin/events/:id/cover-file`

用途：管理端为已存在活动直接上传本地活动封面。上传成功只返回封面字段，不会立即修改活动记录；需要随后调用 `PATCH /admin/events/:id` 提交返回的 `cover_file_id`、`cover_cloud_path`、`cover_url` 才会生效。

权限：`community_admin` 或 `system_admin`。

请求：`multipart/form-data`

| 字段   | 类型 | 必填 | 说明                                                                     |
| ------ | ---- | ---- | ------------------------------------------------------------------------ |
| `file` | file | 是   | 支持 `image/jpeg`、`image/png`、`image/webp`、`image/gif`，当前上限 5 MB |

响应 data：同 `POST /admin/events/cover-file`，其中 `file_asset.biz_id` 为目标活动 ID。

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/event_001/cover-file \
  -H 'x-mock-user-id: user_001' \
  -F 'file=@./cover.jpg;type=image/jpeg'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少文件、文件类型不支持或文件超过大小限制。
- `403 FORBIDDEN`：actor 不是 `community_admin` / `system_admin`。
- `404 NOT_FOUND`：目标活动不存在。

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

| 字段             | 类型                                                 | 必填 | 说明     |
| ---------------- | ---------------------------------------------------- | ---- | -------- |
| `review_status`  | `draft` / `pending_review` / `approved` / `rejected` | 是   | 审核状态 |
| `publish_status` | `draft` / `published` / `offline` / `ended`          | 否   | 发布状态 |
| `reason`         | string                                               | 否   | 审核原因 |

响应 data：`Event`

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/event_001/review \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"review_status":"approved","publish_status":"published"}'
```

常用状态动作：

- 提交审核：`review_status="pending_review"`、`publish_status="draft"`。
- 通过并发布 / 重新发布：`review_status="approved"`、`publish_status="published"`。
- 下线：`review_status="approved"`、`publish_status="offline"`。
- 标记结束：`review_status="approved"`、`publish_status="ended"`。

Public Events 只读取 `review_status="approved"` 且 `publish_status="published"` 的活动。草稿、待审核、已拒绝、已下线、已结束记录仍可通过 `GET /admin/events` 管理，但不会出现在 Mobile public list/detail。

### GET `/admin/events/:id/registrations`

用途：管理端查看某个活动的报名与票据状态。

权限：`community_admin` 或 `system_admin`。

Path params：

| 字段 | 类型   | 说明    |
| ---- | ------ | ------- |
| `id` | string | 活动 ID |

响应 data：`EventAdminRegistrationRow[]`

| 字段                  | 类型        | 说明                         |
| --------------------- | ----------- | ---------------------------- |
| `_id`                 | string      | 报名 ID                      |
| `event_id`            | string      | 活动 ID                      |
| `user_id`             | string      | 用户 ID                      |
| `contact_name`        | string      | 联系人                       |
| `contact_phone`       | string      | 联系电话                     |
| `attendee_count`      | number      | 参与人数                     |
| `registration_status` | string      | 报名状态                     |
| `source_channel`      | string      | 来源渠道                     |
| `ticket_id`           | string      | 票据 ID                      |
| `ticket_code`         | string/null | 票码                         |
| `ticket_status`       | string/null | `valid` / `used` / `invalid` |
| `ticket_used_at`      | string/null | 核销时间                     |

常见错误：

- `403 FORBIDDEN`：非管理员。
- `404 NOT_FOUND`：活动不存在。

示例：

```bash
curl http://127.0.0.1:8787/admin/events/event_001/registrations \
  -H 'x-mock-user-id: user_001'
```

### POST `/admin/events/:id/checkin`

用途：管理端核销活动票据。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段        | 类型   | 必填 | 说明     |
| ----------- | ------ | ---- | -------- |
| `ticket_id` | string | 是   | 票据 ID  |
| `note`      | string | 否   | 核销备注 |

响应 data：`EventTicket`

常见错误：

- `404 NOT_FOUND`：票据不存在。
- `409 CONFLICT`：票据不属于该活动，或票据已核销/状态不可核销。

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/events/event_001/checkin \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"ticket_id":"ticket_001","note":"front desk"}'
```

管理端 / Mobile 烟测期望：

- Admin `/events` 可看到 draft、pending、published、offline、ended 等管理态记录。
- Admin 新建草稿后，Mobile public Events 列表和详情不可见。
- Admin 通过并发布后，Mobile public Events 列表和详情可见。
- Admin 下线后，Mobile public Events 列表和详情不可见；重新发布后恢复可见。
- Admin 报名抽屉可查看联系人、人数、来源、ticket id/code/status/used time，并能用 ticket id 核销。
- 重复核销、错误活动票据、缺失票据应显示错误，不应改变无关票据。
- 报名导出当前延后，后台不提供 export endpoint。

## 8. Discover

### GET `/discover/posts`

用途：获取社区内容流。

权限：无。

Query：

| 字段          | 类型   | 默认值      | 说明              |
| ------------- | ------ | ----------- | ----------------- |
| `page`        | number | `1`         | 页码              |
| `pageSize`    | number | `10`        | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID           |
| `keyword`     | string | optional    | 关键词            |

响应 data：分页 `Post[]`

Post 字段：

| 字段             | 类型        | 说明         |
| ---------------- | ----------- | ------------ |
| `_id`            | string      | 帖子 ID      |
| `author_user_id` | string      | 作者         |
| `community_id`   | string      | 社区         |
| `title`          | string      | 标题         |
| `content`        | string      | 内容         |
| `language`       | `zh` / `en` | 语言         |
| `tag_ids`        | string[]    | 标签         |
| `location_text`  | string/null | 位置文本     |
| `image_file_ids` | string[]    | 图片文件 ID  |
| `image_urls`     | URL[]       | 图片 URL     |
| `place_id`       | string/null | 关联地点     |
| `event_id`       | string/null | 关联活动     |
| `created_at`     | string      | 创建时间     |
| `updated_at`     | string      | 更新时间     |
| `comment_count`  | number      | 可见评论数   |
| `like_count`     | number      | 点赞数       |
| `favorite_count` | number      | 收藏数       |
| `share_count`    | number      | 分享数       |
| `author_display` | object      | 作者展示快照 |
| `status`         | string      | 内容状态     |
| `review_status`  | string      | 审核状态     |

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

| 字段             | 类型        | 必填 | 默认值 | 说明        |
| ---------------- | ----------- | ---- | ------ | ----------- |
| `title`          | string      | 是   | -      | 标题        |
| `content`        | string      | 是   | -      | 内容        |
| `language`       | `zh` / `en` | 是   | -      | 语言        |
| `tag_ids`        | string[]    | 是   | -      | 标签        |
| `location_text`  | string/null | 否   | `null` | 位置        |
| `image_file_ids` | string[]    | 否   | `[]`   | 图片文件 ID |
| `image_urls`     | URL[]       | 否   | `[]`   | 图片 URL    |
| `place_id`       | string/null | 否   | `null` | 关联地点    |
| `event_id`       | string/null | 否   | `null` | 关联活动    |

帖子媒体的 HTTP/H5 生产路径推荐调用 `POST /files/post-media` 直接上传 `multipart/form-data` 的 `file` 字段，成功后把返回的 `file_id` 放入 `image_file_ids`。微信小程序 `cloudbase-function` 模式可先调用 `POST /files/upload-requests` 获取 `cloud_path`，再用 `wx.cloud.uploadFile` 上传真实文件，最后调用 `POST /files/complete` 登记。API 会拒绝不存在、非本人上传、非 public、非 active 或不在 `public/posts/` 下的文件 ID。

响应 data：`Post`

示例：

```bash
curl -X POST http://127.0.0.1:8787/discover/posts \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"title":"Hello","content":"Welcome","language":"en","tag_ids":["intro"]}'
```

### GET `/discover/me/posts`

用途：获取当前 actor 自己发布的帖子，包括 hidden / reported / deleted 等 owner-visible 状态。

权限：需要当前 actor。

Query：

| 字段          | 类型   | 默认值      | 说明              |
| ------------- | ------ | ----------- | ----------------- |
| `page`        | number | `1`         | 页码              |
| `pageSize`    | number | `10`        | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID           |

响应 data：分页 `Post[]`

示例：

```bash
curl 'http://127.0.0.1:8787/discover/me/posts' \
  -H 'x-mock-user-id: user_001'
```

### GET `/discover/posts/:id/comments`

用途：读取可见帖子的可见评论列表。missing、hidden、deleted、reported 等不可用帖子返回 `404`，不暴露评论。

权限：无。

Query：

| 字段       | 类型   | 默认值 | 说明              |
| ---------- | ------ | ------ | ----------------- |
| `page`     | number | `1`    | 页码              |
| `pageSize` | number | `20`   | 每页数量，最大 50 |

响应 data：分页 `Comment[]`。`Comment` 包含 `_id`、`post_id`、`author_user_id`、`content`、`language`、`status`、`created_at`。

示例：

```bash
curl 'http://127.0.0.1:8787/discover/posts/post_001/comments?page=1&pageSize=20'
```

### POST `/discover/posts/:id/comments`

用途：发表评论。

权限：需要当前 actor。

Body：

| 字段       | 类型        | 必填 | 说明     |
| ---------- | ----------- | ---- | -------- |
| `content`  | string      | 是   | 评论内容 |
| `language` | `zh` / `en` | 是   | 语言     |

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

| 字段          | 类型   | 必填 | 说明     |
| ------------- | ------ | ---- | -------- |
| `reason`      | string | 是   | 举报原因 |
| `description` | string | 否   | 补充描述 |

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

| 字段            | 类型                             | 必填 | 说明     |
| --------------- | -------------------------------- | ---- | -------- |
| `review_status` | `visible` / `hidden` / `deleted` | 是   | 处理结果 |
| `reason`        | string                           | 否   | 原因     |

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
- `PATCH /admin/places/:id` 是 partial update；未传字段保持原值，非法字段值返回 `400 VALIDATION_ERROR`。
- `DELETE /admin/places/:id` 是 admin hard delete；成功后该地点从 admin list、public list、map marker 和 public detail 中消失。
- public places 只应展示 `status=published` 且属于目标 `communityId` 的地点。

### GET `/places`

用途：获取 public 地点列表。

权限：无。

Query：

| 字段          | 类型                   | 默认值        | 说明              |
| ------------- | ---------------------- | ------------- | ----------------- |
| `page`        | number                 | `1`           | 页码              |
| `pageSize`    | number                 | `10`          | 每页数量，最大 50 |
| `communityId` | string                 | `tongzilin`   | 社区 ID           |
| `keyword`     | string                 | optional      | 关键词            |
| `category`    | string                 | optional      | 一级或二级分类    |
| `tag`         | string                 | optional      | 标签 ID           |
| `recommended` | boolean                | optional      | 是否只看推荐      |
| `sort`        | `recommended` / `name` | `recommended` | 排序              |

响应 data：分页 `PlaceListItem[]`

PlaceListItem 字段：

| 字段                                              | 类型        | 说明         |
| ------------------------------------------------- | ----------- | ------------ |
| `_id`                                             | string      | 地点 ID      |
| `name_zh` / `name_en`                             | string      | 双语名称     |
| `cover_url`                                       | URL/null    | 封面         |
| `category_level_1` / `category_level_2`           | string      | 分类         |
| `short_address_zh` / `short_address_en`           | string      | 短地址       |
| `summary_zh` / `summary_en`                       | string      | 摘要         |
| `tag_ids`                                         | string[]    | 标签         |
| `is_recommended`                                  | boolean     | 是否推荐     |
| `recommended_reason_zh` / `recommended_reason_en` | string/null | 推荐理由     |
| `supports_navigation`                             | boolean     | 是否支持导航 |

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

| 字段                  | 类型        | 说明     |
| --------------------- | ----------- | -------- |
| `_id`                 | string      | 地点 ID  |
| `name_zh` / `name_en` | string      | 名称     |
| `category_level_1`    | string      | 一级分类 |
| `is_recommended`      | boolean     | 是否推荐 |
| `location`            | Coordinates | 经纬度   |

示例：

```bash
curl http://127.0.0.1:8787/places/map-markers
```

### GET `/places/:id`

用途：获取 public 地点详情。

权限：无。

响应 data：`PlaceDetail`

关键字段：

| 字段                                      | 类型                 | 说明                                  |
| ----------------------------------------- | -------------------- | ------------------------------------- |
| `_id`                                     | string               | 地点 ID                               |
| `community_id`                            | string               | 社区                                  |
| `name_zh` / `name_en`                     | string               | 名称                                  |
| `cover_url`                               | URL/null             | 封面                                  |
| `cover_source`                            | object/null          | 外部封面来源归因；非外部封面为 `null` |
| `category_level_1` / `category_level_2`   | string               | 分类                                  |
| `tag_ids`                                 | string[]             | 标签                                  |
| `address_zh` / `address_en`               | string               | 完整地址                              |
| `location`                                | Coordinates          | 经纬度                                |
| `business_hours_zh` / `business_hours_en` | string               | 营业时间                              |
| `intro_zh` / `intro_en`                   | string               | 简介                                  |
| `gallery_media`                           | PlaceGalleryMedia[]  | 主图集字段                            |
| `external_gallery_media`                  | PlaceExternalMedia[] | 外部来源图集字段                      |
| `gallery_urls`                            | URL[]                | 由 `gallery_media.url` 派生的兼容字段 |
| `is_recommended`                          | boolean              | 是否推荐                              |
| `supports_navigation`                     | boolean              | 是否支持导航                          |
| `supports_favorite`                       | boolean              | 是否支持收藏                          |
| `supports_share`                          | boolean              | 是否支持分享                          |
| `navigation`                              | object               | 导航信息                              |
| `share`                                   | object               | 分享信息                              |

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

`external_gallery_media`：

```json
{
  "source": "amap",
  "source_place_id": "B001",
  "image_url": "https://store.is.autonavi.com/showpic/B001.jpg",
  "image_title": "门头",
  "attribution": {
    "label": "Image source: Amap",
    "provider_name": "Amap"
  }
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

### GET `/admin/places/poi-search`

用途：管理端按中文名称、地标或地址搜索腾讯地图 POI 候选，用于新建/编辑地点时自动填充中文名、中文地址、经纬度和腾讯 POI ID。

权限：`community_admin` 或 `system_admin`。

Query：

| 字段      | 类型   | 必填 | 说明                                 |
| --------- | ------ | ---- | ------------------------------------ |
| `keyword` | string | 是   | 地标或地址关键词，服务端会 trim 校验 |

响应 data：`PlacePoiSearchItem[]`

| 字段                             | 类型        | 说明                            |
| -------------------------------- | ----------- | ------------------------------- |
| `id`                             | string      | 腾讯地图 POI ID 或稳定 fallback |
| `title`                          | string      | 腾讯地图地点名称                |
| `address`                        | string      | 腾讯地图中文地址                |
| `category`                       | string/null | 腾讯地图分类                    |
| `location`                       | object      | `{ latitude, longitude }`       |
| `province` / `city` / `district` | string/null | 行政区信息                      |

示例：

```bash
curl 'http://127.0.0.1:8787/admin/places/poi-search?keyword=桐梓林' \
  -H 'x-mock-user-id: user_001'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少或传入空 `keyword`。
- `500 CONFIGURATION_ERROR`：API 端未配置 `TENCENT_MAP_KEY`。
- `502 UPSTREAM_ERROR`：腾讯地图接口不可用、返回非 0 状态或响应结构不符合预期。

### GET `/admin/places/amap-media-search`

用途：管理端搜索 Amap POI 并返回规范化图片候选，用于选择外部封面或外部图集图片。

权限：`community_admin` 或 `system_admin`。

Query：

| 字段      | 类型   | 必填 | 默认值 | 说明                |
| --------- | ------ | ---- | ------ | ------------------- |
| `keyword` | string | 是   | -      | 地点关键词          |
| `city`    | string | 否   | `成都` | Amap 城市过滤关键词 |

响应 data：`PlaceAmapMediaSearchItem[]`，每个候选含 `image_candidates`。图片候选字段为 `source="amap"`、`source_place_id`、`image_url`、`image_title`、`attribution`。

示例：

```bash
curl 'http://127.0.0.1:8787/admin/places/amap-media-search?keyword=桐梓林' \
  -H 'x-mock-user-id: user_001'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少或传入空 `keyword`。
- `500 CONFIGURATION_ERROR`：API 端未配置 `AMAP_WEB_SERVICE_KEY`。
- `502 UPSTREAM_ERROR`：Amap 接口不可用、返回失败状态或响应结构不符合预期。

### POST `/admin/places`

用途：管理端新建地点。

权限：`community_admin` 或 `system_admin`。

Body：

| 字段                                              | 类型                              | 必填 | 默认值  | 说明                 |
| ------------------------------------------------- | --------------------------------- | ---- | ------- | -------------------- |
| `name_zh` / `name_en`                             | string                            | 是   | -       | 双语名称             |
| `category_level_1`                                | string                            | 是   | -       | 一级分类             |
| `category_level_2`                                | string                            | 是   | -       | 二级分类             |
| `address_zh` / `address_en`                       | string                            | 是   | -       | 地址                 |
| `location`                                        | Coordinates                       | 是   | -       | 经纬度               |
| `business_hours_zh` / `business_hours_en`         | string                            | 是   | -       | 营业时间             |
| `intro_zh` / `intro_en`                           | string                            | 是   | -       | 简介                 |
| `cover_file_id`                                   | string/null                       | 否   | `null`  | 封面文件 ID          |
| `cover_url`                                       | URL/null                          | 否   | `null`  | 封面 URL             |
| `cover_source`                                    | object/null                       | 否   | `null`  | 外部封面来源归因     |
| `tag_ids`                                         | string[]                          | 否   | `[]`    | 标签                 |
| `recommended_reason_zh` / `recommended_reason_en` | string/null                       | 否   | `null`  | 推荐理由             |
| `is_recommended`                                  | boolean                           | 否   | `false` | 是否推荐             |
| `recommended_rank`                                | number                            | 否   | `0`     | 推荐排序             |
| `gallery_file_ids`                                | string[]                          | 否   | `[]`    | 图集文件 ID          |
| `external_gallery_media`                          | PlaceExternalMedia[]              | 否   | `[]`    | 外部来源图集引用     |
| `gallery_urls`                                    | URL[]                             | 否   | `[]`    | 兼容图集 URL         |
| `tencent_map_poi_id`                              | string/null                       | 否   | `null`  | 腾讯地图 POI         |
| `supports_navigation`                             | boolean                           | 否   | `true`  | 支持导航             |
| `supports_favorite`                               | boolean                           | 否   | `true`  | 支持收藏             |
| `supports_share`                                  | boolean                           | 否   | `true`  | 支持分享             |
| `status`                                          | `draft` / `published` / `offline` | 否   | `draft` | 发布状态             |
| `import_review`                                   | object/null                       | 否   | `null`  | 志愿者导入审核元数据 |

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

关键错误：

- `400 VALIDATION_ERROR`：请求 body 不符合 `UpdatePlaceInputSchema`，例如非法分类、状态或 URL。
- `403 FORBIDDEN`：actor 不是 `community_admin` 或 `system_admin`。
- `404 NOT_FOUND`：地点 ID 不存在。

示例：

```bash
curl -X PATCH http://127.0.0.1:8787/admin/places/place_001 \
  -H 'content-type: application/json' \
  -H 'x-mock-user-id: user_001' \
  -d '{"is_recommended":true,"recommended_rank":1}'
```

### POST `/admin/places/gallery-files`

用途：管理端在创建地点前直接上传自有图集图片。成功后后端创建 completed active `FileAsset`，先以 pending 归属记录；创建地点时如果提交了返回的 `file_id`，后端会自动把该资产绑定到新地点。该路径不用于外部 Amap 图片；Amap 图片只保存为外部引用。

权限：`community_admin` 或 `system_admin`。

请求：`multipart/form-data`

| 字段   | 类型 | 必填 | 说明                                                                     |
| ------ | ---- | ---- | ------------------------------------------------------------------------ |
| `file` | file | 是   | 支持 `image/jpeg`、`image/png`、`image/webp`、`image/gif`，当前上限 5 MB |

响应 data：

```json
{
  "file_asset": {
    "_id": "file_001",
    "file_id": "cloud://...",
    "cloud_path": "public/places/_pending/upload/a.jpg",
    "visibility": "public",
    "biz_type": "place_gallery",
    "biz_id": "__pending_place_gallery__",
    "uploaded_by": "user_001",
    "status": "active"
  },
  "gallery_file_ids": ["cloud://..."]
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/places/gallery-files \
  -H 'x-mock-user-id: user_001' \
  -F 'file=@./entrance.jpg;type=image/jpeg'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少文件、文件类型不支持或文件超过大小限制。
- `403 FORBIDDEN`：actor 不是 `community_admin` / `system_admin`。

### POST `/admin/places/:id/gallery-files`

用途：管理端为已存在地点直接上传自有图集图片。成功后后端创建 completed active `FileAsset`，并将新 `file_id` 追加到目标地点的 `gallery_file_ids`。该路径不用于外部 Amap 图片；Amap 图片只保存为外部引用。

权限：`community_admin` 或 `system_admin`。

请求：`multipart/form-data`

| 字段   | 类型 | 必填 | 说明                                                                     |
| ------ | ---- | ---- | ------------------------------------------------------------------------ |
| `file` | file | 是   | 支持 `image/jpeg`、`image/png`、`image/webp`、`image/gif`，当前上限 5 MB |

响应 data：

```json
{
  "file_asset": {
    "_id": "file_001",
    "file_id": "cloud://...",
    "cloud_path": "public/places/place_001/a.jpg",
    "visibility": "public",
    "biz_type": "place_gallery",
    "biz_id": "place_001",
    "uploaded_by": "user_001",
    "status": "active"
  },
  "gallery_file_ids": ["cloud://..."]
}
```

示例：

```bash
curl -X POST http://127.0.0.1:8787/admin/places/place_001/gallery-files \
  -H 'x-mock-user-id: user_001' \
  -F 'file=@./entrance.jpg;type=image/jpeg'
```

关键错误：

- `400 VALIDATION_ERROR`：缺少文件、文件类型不支持或文件超过大小限制。
- `403 FORBIDDEN`：actor 不是 `community_admin` / `system_admin`。
- `404 NOT_FOUND`：目标地点不存在。

### DELETE `/admin/places/:id`

用途：管理端删除地点。删除为 hard delete，不会新增 `deleted` 状态，也不会清理既有关联文件资产。

权限：`community_admin` 或 `system_admin`。

响应 data：

```json
{
  "deleted_id": "place_001"
}
```

删除后效果：

- `GET /admin/places` 不再包含该地点。
- `GET /places` 和 `GET /places/map-markers` 不再返回该地点。
- `GET /places/:id` 返回 `404 NOT_FOUND`。

关键错误：

- `403 FORBIDDEN`：actor 不是 `community_admin` 或 `system_admin`。
- `404 NOT_FOUND`：地点 ID 不存在或已删除。

示例：

```bash
curl -X DELETE http://127.0.0.1:8787/admin/places/place_001 \
  -H 'x-mock-user-id: user_001'
```

## 10. Announcements

### GET `/announcements`

用途：获取公告列表。

权限：无。

Query：

| 字段          | 类型   | 默认值      | 说明              |
| ------------- | ------ | ----------- | ----------------- |
| `page`        | number | `1`         | 页码              |
| `pageSize`    | number | `10`        | 每页数量，最大 50 |
| `communityId` | string | `tongzilin` | 社区 ID           |

响应 data：分页 `Announcement[]`

Announcement 字段：

| 字段                        | 类型   | 说明        |
| --------------------------- | ------ | ----------- |
| `_id`                       | string | 公告 ID     |
| `community_id`              | string | 社区        |
| `title_zh` / `title_en`     | string | 标题        |
| `summary_zh` / `summary_en` | string | 摘要        |
| `content_zh` / `content_en` | string | 正文        |
| `cover_file_id`             | string | 封面文件 ID |
| `cover_url`                 | URL    | 封面 URL    |
| `status`                    | string | 状态        |
| `published_at`              | string | 发布时间    |

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

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| `_id`        | string | 通知 ID  |
| `user_id`    | string | 用户 ID  |
| `title`      | string | 标题     |
| `body`       | string | 内容     |
| `status`     | string | 状态     |
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

| 常量                 | prefix                  | 用途         |
| -------------------- | ----------------------- | ------------ |
| `eventCovers`        | `public/events/`        | 活动封面     |
| `placeGallery`       | `public/places/`        | 地点图集     |
| `postImages`         | `public/posts/`         | 帖子图片     |
| `announcementImages` | `public/announcements/` | 公告图片     |
| `tickets`            | `private/tickets/`      | 票券二维码   |
| `exports`            | `private/exports/`      | 导出文件     |
| `admin`              | `private/admin/`        | 后台私有文件 |

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

| 字段            | 类型                 | 必填 | 说明                                        |
| --------------- | -------------------- | ---- | ------------------------------------------- |
| `biz_type`      | string               | 是   | 业务类型，如 `place_gallery`、`event_cover` |
| `biz_id`        | string               | 是   | 业务 ID                                     |
| `file_name`     | string               | 是   | 文件名                                      |
| `visibility`    | `public` / `private` | 是   | 可见性                                      |
| `target_prefix` | enum                 | 是   | 必须是上表 prefix 之一                      |

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

### POST `/files/post-media`

用途：为 discover 帖子直接上传图片或视频媒体。成功后返回 active public `FileAsset`，创建帖子时提交返回的 `file_id` 到 `image_file_ids`。

权限：需要当前 actor。

请求：`multipart/form-data`

| 字段   | 类型 | 必填 | 说明                               |
| ------ | ---- | ---- | ---------------------------------- |
| `file` | file | 是   | 支持 jpg/png/webp/gif/mp4/mov/webm |

响应 data：`FileAsset`

示例：

```bash
curl -X POST http://127.0.0.1:8787/files/post-media \
  -H 'x-mock-user-id: user_001' \
  -F 'file=@./local-tip.jpg'
```

### POST `/files/complete`

用途：上传完成后登记文件资产。

权限：

- 普通文件：需要当前 actor。
- place gallery：需要 `community_admin` 或 `system_admin`。

Body：

| 字段         | 类型                 | 必填 | 说明       |
| ------------ | -------------------- | ---- | ---------- |
| `biz_type`   | string               | 是   | 业务类型   |
| `biz_id`     | string               | 是   | 业务 ID    |
| `file_id`    | string               | 是   | 云文件 ID  |
| `cloud_path` | string               | 是   | cloud path |
| `visibility` | `public` / `private` | 是   | 可见性     |

响应 data：`FileAsset`

FileAsset 字段：

| 字段          | 类型                 | 说明        |
| ------------- | -------------------- | ----------- |
| `_id`         | string               | 文件资产 ID |
| `file_id`     | string               | 云文件 ID   |
| `cloud_path`  | string               | cloud path  |
| `visibility`  | `public` / `private` | 可见性      |
| `biz_type`    | string               | 业务类型    |
| `biz_id`      | string               | 业务 ID     |
| `uploaded_by` | string               | 上传用户    |
| `status`      | string               | 状态        |

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

| 字段      | 类型   | 必填 | 说明      |
| --------- | ------ | ---- | --------- |
| `file_id` | string | 是   | 云文件 ID |

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

| 模块     | 方法     | 路径                                   | 权限        | 用途                   |
| -------- | -------- | -------------------------------------- | ----------- | ---------------------- |
| Events   | `GET`    | `/admin/events`                        | admin       | 管理端活动列表         |
| Events   | `POST`   | `/admin/events`                        | admin       | 创建活动               |
| Events   | `PATCH`  | `/admin/events/:id`                    | admin       | 更新活动               |
| Events   | `POST`   | `/admin/events/:id/review`             | admin       | 审核活动               |
| Events   | `GET`    | `/admin/events/:id/registrations`      | admin       | 查看活动报名           |
| Events   | `POST`   | `/admin/events/:id/checkin`            | admin       | 核销票据               |
| Discover | `POST`   | `/admin/discover/posts/:id/moderation` | admin       | 审核/治理帖子          |
| Places   | `GET`    | `/admin/places`                        | admin       | 地点列表               |
| Places   | `POST`   | `/admin/places`                        | admin       | 创建地点               |
| Places   | `PATCH`  | `/admin/places/:id`                    | admin       | 更新地点               |
| Places   | `GET`    | `/admin/places/amap-media-search`      | admin       | Amap 图片候选搜索      |
| Places   | `POST`   | `/admin/places/gallery-files`          | admin       | 创建前上传地点图集图片 |
| Places   | `POST`   | `/admin/places/:id/gallery-files`      | admin       | 直接追加地点图集图片   |
| Places   | `DELETE` | `/admin/places/:id`                    | admin       | 删除地点               |
| Files    | `POST`   | `/files/upload-requests`               | conditional | 创建上传请求           |
| Files    | `POST`   | `/files/post-media`                    | actor       | 直接上传帖子媒体       |
| Files    | `POST`   | `/files/complete`                      | conditional | 完成文件登记           |
| Files    | `POST`   | `/files/private-url`                   | actor       | 获取私有文件临时地址   |

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
