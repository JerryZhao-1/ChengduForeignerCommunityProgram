# Postman 调试与 OpenAPI 导入指南

更新时间：2026-06-22
OpenAPI 文件：`docs/openapi/community-map-api.openapi.yaml`

## 1. 后端会部署在哪里

当前项目的正式目标不是“只使用微信云数据库”，也不是部署到独立服务器 / VM。

正式目标是 CloudBase 同生态部署：

| 层级 | 目标资源 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| 数据库 | CloudBase 文档型数据库 | 存储 users、places、file_assets、configs、operation_logs，以及后续 events/posts/comments/announcements/notifications | dev 环境和 v1 集合已实时验证；当前 live `places` collection 为空 |
| API / BFF | CloudBase HTTP 云函数 `community-map-api` | 统一承接 Mobile、小程序、Admin、Postman 请求；执行校验、权限、响应 envelope、provider 选择和文件临时 URL | dev HTTP function 和 `/api` route 已验证，证据见 `docs/cloudbase-dev-api-deployment.md` |
| 文件 | CloudBase 云存储 | 存放地点图集、活动封面、帖子图片、票券二维码、导出文件 | 路径规则已记录；真实媒体 live flow 待验收 |
| Admin 托管 | CloudBase 静态网站托管 | 部署 Web 管理后台 | dev hosting domain 已记录；正式联调待验收 |

为什么不能只用微信云数据库：

- 前端和后台不直接读写核心业务数据库，统一走 API / BFF。
- API 层负责 Zod 校验、统一成功/失败 envelope、权限、mock/live provider 切换、文件临时 URL、admin 角色判断和跨端 contract。
- Postman 调试目标也应是 HTTP API，而不是直接连数据库。

本期不需要额外维护独立服务器。上线前要完成的是 CloudBase HTTP 云函数、HTTP 访问服务 `/api` route、文档型数据库、云存储和静态托管的联调验收。

## 2. 当前可用环境

### 本地 HTTP 环境

本地 API Base URL：

```text
http://127.0.0.1:8787
```

启动 API：

```bash
pnpm dev:api
```

如果 Node 24 遇到 Koa 依赖链兼容问题，可使用 README 中的兼容命令：

```bash
NODE_OPTIONS=--no-experimental-require-module \
pnpm --filter @community-map/api exec tsx src/dev.ts
```

本地 smoke test：

```bash
curl http://127.0.0.1:8787/health
```

### CloudBase dev 环境

CloudBase dev API Base URL：

```text
https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api
```

- `community-map-api` 已部署为正式 CloudBase HTTP function。
- CloudBase HTTP access service 已创建 `/api` route。
- `GET {{baseUrl}}/health`、`GET {{baseUrl}}/places`、`GET {{baseUrl}}/places/map-markers` 已通过 dev smoke。
- 当前 live `places` collection 为空，因此 list/map 返回空数据是预期 live 状态，不是 Postman 配置问题。

如果 `GET /api/health` 不通，优先检查 CloudBase function 和 HTTP route，不要先怀疑数据库或 Postman 配置。

## 3. Postman 导入 OpenAPI

1. 打开 Postman。
2. 点击 `Import`。
3. 选择 `Files`。
4. 选择仓库文件：

```text
docs/openapi/community-map-api.openapi.yaml
```

5. 导入后 Postman 会生成一个 collection，名称类似：

```text
Chengdu Tongzilin Community Map API
```

6. 如果 Postman 提示 server 变量或 URL，可先选择 local server。

## 4. 创建 Postman Environments

### local environment

建议新建环境：`Community Map - Local`

变量：

| 变量 | Initial value | Current value |
| --- | --- | --- |
| `baseUrl` | `http://127.0.0.1:8787` | `http://127.0.0.1:8787` |
| `mockActorId` | `user_001` | `user_001` |

### cloudbase-dev environment

建议新建环境：`Community Map - CloudBase Dev`

变量：

| 变量 | Initial value | Current value |
| --- | --- | --- |
| `baseUrl` | `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` | `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` |
| `mockActorId` | `user_001` | `user_001` |

注意：CloudBase dev 当前已完成 function 和 `/api` route smoke；完整 places live acceptance 仍需先导入或创建 published live places 数据。

## 5. 配置 Postman Headers

建议在 collection 或 environment 级别统一配置：

```text
content-type: application/json
x-mock-user-id: {{mockActorId}}
```

使用建议：

- admin 调试默认使用 `user_001`。
- 普通用户或权限负路径可切换为 `user_002`。
- `x-mock-user-id` 只用于当前本地 / dev mock 联调，不是生产认证方案。

## 6. 推荐调试顺序

### 6.1 Smoke

先确认服务可达：

```text
GET {{baseUrl}}/health
```

预期：

```json
{
  "ok": true
}
```

再确认 actor：

```text
GET {{baseUrl}}/auth/me
```

预期：返回 `success=true`，`data._id` 与 `mockActorId` 对应。

### 6.2 Public APIs

按以下顺序调试公开读取接口：

```text
GET {{baseUrl}}/events
GET {{baseUrl}}/events/:id
GET {{baseUrl}}/discover/posts
GET {{baseUrl}}/discover/posts/:id
GET {{baseUrl}}/places
GET {{baseUrl}}/places/map-markers
GET {{baseUrl}}/places/:id
GET {{baseUrl}}/announcements
GET {{baseUrl}}/announcements/:id
```

### 6.3 Actor APIs

需要 `x-mock-user-id`：

```text
POST {{baseUrl}}/events/:id/registrations
GET {{baseUrl}}/events/me/registrations
GET {{baseUrl}}/events/registrations/:id/ticket
POST {{baseUrl}}/discover/posts
POST {{baseUrl}}/discover/posts/:id/comments
POST {{baseUrl}}/discover/posts/:id/report
GET {{baseUrl}}/notifications
POST {{baseUrl}}/notifications/:id/read
```

### 6.4 Admin APIs

需要 `community_admin` 或 `system_admin` actor，默认用 `user_001`：

```text
POST {{baseUrl}}/admin/events
PATCH {{baseUrl}}/admin/events/:id
POST {{baseUrl}}/admin/events/:id/review
POST {{baseUrl}}/admin/events/:id/checkin
POST {{baseUrl}}/admin/discover/posts/:id/moderation
GET {{baseUrl}}/admin/places
POST {{baseUrl}}/admin/places
PATCH {{baseUrl}}/admin/places/:id
```

### 6.5 Files flow

典型顺序：

```text
POST {{baseUrl}}/files/upload-requests
POST {{baseUrl}}/files/complete
POST {{baseUrl}}/files/private-url
```

地点图集规则：

- `biz_type=place_gallery` 需要 admin。
- `target_prefix=public/places/` 需要 admin。
- `cloud_path` 以 `public/places/` 开头的 complete 需要 admin。

## 7. 常用 Postman 请求示例

### Auth me

```http
GET {{baseUrl}}/auth/me
x-mock-user-id: {{mockActorId}}
```

### Places list

```http
GET {{baseUrl}}/places?communityId=tongzilin&recommended=true&sort=recommended&page=1&pageSize=10
```

### Create place

```http
POST {{baseUrl}}/admin/places
content-type: application/json
x-mock-user-id: {{mockActorId}}
```

Body:

```json
{
  "name_zh": "社区服务中心",
  "name_en": "Community Service Center",
  "category_level_1": "public-service",
  "category_level_2": "service-center",
  "address_zh": "桐梓林",
  "address_en": "Tongzilin",
  "location": {
    "latitude": 30.615,
    "longitude": 104.062
  },
  "business_hours_zh": "周一至周五 09:00-18:00",
  "business_hours_en": "Mon-Fri 09:00-18:00",
  "intro_zh": "社区服务介绍",
  "intro_en": "Community service introduction",
  "status": "published"
}
```

### Create event registration

```http
POST {{baseUrl}}/events/event_001/registrations
content-type: application/json
x-mock-user-id: {{mockActorId}}
```

Body:

```json
{
  "contact_name": "Jerry",
  "contact_phone": "13800000000",
  "attendee_count": 1,
  "source_channel": "miniapp"
}
```

### Negative path: invalid places sort

```http
GET {{baseUrl}}/places?sort=latest
```

预期：

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

### Negative path: non-admin calls admin API

将环境变量 `mockActorId` 改为普通用户，例如：

```text
user_002
```

请求：

```http
GET {{baseUrl}}/admin/places
x-mock-user-id: {{mockActorId}}
```

预期：`403 FORBIDDEN`。

## 8. OpenAPI 文件维护说明

当前 OpenAPI spec 是静态文件：

```text
docs/openapi/community-map-api.openapi.yaml
```

当前没有新增后端接口：

```text
GET /openapi.json
```

也没有新增 Swagger UI。原因：

- 当前目标是快速支持 Postman 导入和后端/后台联调。
- 不改变 API runtime，降低上线前风险。

以后如需自动生成或在线暴露 OpenAPI，可再补：

- OpenAPI generator script
- `/openapi.json` static route
- Swagger UI 或 Scalar 文档页
- CI 校验 OpenAPI 与 shared contracts 是否一致

## 9. 调试问题排查

### 本地 Postman 不通

检查：

1. API 是否启动：`pnpm dev:api`
2. Base URL 是否为 `http://127.0.0.1:8787`
3. `GET /health` 是否返回 `{ "ok": true }`
4. POST/PATCH 是否设置 `content-type: application/json`
5. 需要 actor 的接口是否设置 `x-mock-user-id`

### CloudBase dev 不通

检查顺序：

1. CloudBase MCP 是否已登录。
2. 是否绑定 env：`cloud1-d7gxdk8t43bd639c0`。
3. `community-map-api` 是否仍是正式 HTTP function。
4. HTTP access service 是否仍存在 `/api` route。
5. `GET https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health` 是否通过。
6. 如果 health 不通，先修 function/route，不要先查数据库。

### Admin 接口返回 403

检查：

1. Header 是否有 `x-mock-user-id`。
2. 当前 actor 是否有 `community_admin` 或 `system_admin`。
3. 默认建议使用 `user_001` 调试 admin。

### Places public list 看不到新建地点

检查：

1. 新建地点是否 `status=published`。
2. `community_id` 是否为 `tongzilin`。
3. 经纬度是否合法。
4. 前后台是否连接同一个 API Base URL。
5. 推荐入口是否设置 `is_recommended=true`。

## 10. 上线前必须确认

- CloudBase dev API smoke 通过；places full live acceptance 需在导入 live 数据后通过。
- CloudBase prod env 已确认。
- `community-map-api` 正式部署。
- `/api` route 可访问。
- Admin hosting 能访问正确 API domain。
- 文档型数据库安全规则已验收。
- 云存储 public/private 权限已验收。
- `x-mock-user-id` 已替换或明确不作为生产认证方案。
