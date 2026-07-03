# AGENTS.md

本文件是本仓库面向 Codex / Claude / Qoder 等 AI coding agents 的主入口指南。开始任何修改前，先阅读本文件，再按任务范围阅读相关源码、`docs/` 文档、`openspec/` 变更与 `packages/shared` 中的契约定义。

## 1. 项目简介

本项目是面向成都桐梓林社区的社区地图与信息入口，服务在地居民与外籍居民。当前重点是在单社区场景下跑通“可浏览、可参与、可维护”的真实闭环，不做多社区平台化。

核心功能模块：

- `events`：活动浏览、报名、票券、核销。
- `discover`：社区内容流、帖子、评论、审核。
- `places`：地点列表、地图展示、地点详情、导航信息、管理端维护。

当前技术栈：

- Monorepo：`pnpm` workspace，Node.js `>=20`，`pnpm@10.6.5`。
- 前端管理端：Vue 3 + Vite + Element Plus。
- 移动端 / H5 / 微信小程序：uni-app + Vue + Vite；微信小程序端默认使用 TDesign MiniProgram 作为主要 UI 组件库。
- 后端：TypeScript + Koa + `@koa/router`，可作为本地 BFF 或 CloudBase HTTP 云函数入口。
- 数据与契约：Zod schema、共享 TypeScript types、共享 API contracts。
- 测试：Vitest、TypeScript typecheck、ESLint。
- 云服务与地图：CloudBase、CloudBase 文档型数据库 / 云存储、腾讯地图。

## 2. 项目结构

主要源码与文档目录：

- `apps/admin`：后台管理端，Vue + Vite。页面、路由、管理端 API client 和管理端私有 UI 逻辑放在这里。
- `apps/mobile`：uni-app 前台，支持 H5 与微信小程序。页面、导航、移动端 API client、移动端状态和端内组件放在这里。
- `apps/api`：统一 API / BFF / CloudBase HTTP 云函数层。路由在 `src/routes/`，provider 在 `src/providers/`，HTTP、鉴权和错误处理在 `src/lib/`。
- `packages/shared`：跨端共享层。放 schemas、contracts、paths、enums、types、mock service、mock client 和共享测试夹具。
- `docs`：项目文档、接口说明、仓库协作说明、部署与数据采集说明。
- `openspec`：OpenSpec 项目上下文、正式 specs、活跃 changes、归档 changes。
- `auto_test_openspec`：OpenSpec 验证 bundle 历史。视为审计证据，不要手改既有 run folder。
- `scripts`：项目辅助脚本。
- 根目录配置：`package.json`、`pnpm-workspace.yaml`、`tsconfig*.json`、`eslint.config.mjs`、`vitest.config.ts`。

不要手工修改这些生成目录或依赖目录：

- `node_modules/`
- `.pnpm-store/`
- `dist/`
- `coverage/`
- `.turbo/`

## 3. 开发与运行命令

环境要求：

```bash
corepack enable
node --version
pnpm --version
pnpm install
```

根目录常用命令：

```bash
pnpm dev:admin
pnpm dev:mobile
pnpm dev:mobile:mp
pnpm dev:api
pnpm test
pnpm typecheck
pnpm lint
```

按包运行：

```bash
pnpm --filter @community-map/admin dev
pnpm --filter @community-map/admin build
pnpm --filter @community-map/admin typecheck

pnpm --filter @community-map/mobile dev:h5
pnpm --filter @community-map/mobile build:h5
pnpm --filter @community-map/mobile dev:mp-weixin
pnpm --filter @community-map/mobile build:mp-weixin
pnpm --filter @community-map/mobile typecheck

pnpm --filter @community-map/api dev
pnpm --filter @community-map/api dev:cloudbase
pnpm --filter @community-map/api typecheck

pnpm --filter @community-map/shared typecheck
```

默认本地端口：

- Admin：`http://localhost:5173`
- Mobile H5：`http://localhost:5174`
- API：`http://localhost:8787`
- API health check：`GET http://127.0.0.1:8787/health`

联调示例：

```bash
# terminal 1
pnpm dev:api

# terminal 2
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @community-map/admin dev

# terminal 3
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @community-map/mobile dev:h5
```

OpenSpec 相关变更需要校验：

```bash
openspec validate <change-id> --strict --no-interactive
```

## 4. 配置与环境变量

Admin 与 Mobile 默认使用 mock client。联调真实 HTTP API 时必须显式配置 HTTP 模式。

前端环境变量：

- `VITE_API_MODE`
  - `mock`：默认，本地 mock client。
  - `http`：通过 HTTP 请求 `VITE_API_BASE_URL`。
  - `cloudbase-function`：主要用于 `apps/mobile`，通过微信 CloudBase function 调用。
- `VITE_API_BASE_URL`：HTTP API 地址，默认 `http://localhost:8787`。
- `VITE_MOCK_ACTOR_ID`：mock actor，默认 `user_001`。
- `VITE_CLOUDBASE_ENV_ID`：Mobile CloudBase 环境 ID。
- `VITE_CLOUDBASE_FUNCTION_NAME`：Mobile CloudBase 函数名，默认 `community-map-api`。

API 环境变量：

- `API_PROVIDER`
  - `mock`：默认 provider。
  - `cloudbase`：CloudBase provider；当前部分 CloudBase 能力仍复用 mock provider 行为。
- `AMAP_WEB_SERVICE_KEY`：服务端 Amap WebService Key，用于管理端地点图片候选搜索；不要配置为前端 `VITE_` 变量。
- `TENCENT_MAP_KEY` / `TENCENT_MAP_SECRET_KEY`：服务端腾讯地图 POI 搜索配置；不要配置为前端 `VITE_` 变量。

配置要求：

- 不要硬编码密钥、token、腾讯地图 key、生产后端地址、CloudBase 私密配置或用户凭证。
- 本地、测试、生产配置必须通过环境变量或受控部署配置区分。
- 新增环境变量时，同步更新相关文档和运行说明。

## 5. 代码规范

通用规范：

- 统一使用 TypeScript。
- Prettier 约定：`semi: true`、`singleQuote: false`、`trailingComma: none`。
- ESLint 使用根目录 `eslint.config.mjs`，当前默认检查 TS/JS 文件，忽略 `*.vue`、`dist`、`coverage`、`.turbo`、`node_modules`。
- 优先做最小必要改动，不做无关重构。
- 不要在 app 内重复定义跨端 DTO、schema、enum、contract；共享内容放 `packages/shared`。

文件组织：

- 按业务模块组织：`events`、`discover`、`places`、`announcements`、`notifications`、`files`、`auth`。
- Vue 页面、路由、端内组件和端内状态留在对应 app。
- API 路由放 `apps/api/src/routes/`，provider 能力放 `apps/api/src/providers/`。
- 共享 schema 放 `packages/shared/src/schemas/`。
- 共享 contract 放 `packages/shared/src/contracts/`。
- 共享路径常量放 `packages/shared/src/contracts/paths.ts`。
- 共享 mock 行为放 `packages/shared/src/mock/`。

架构约定：

- Admin 和 Mobile 通过统一 API contract 访问业务数据，不绕过 BFF 直接读写核心业务数据。
- API 层使用 Zod 校验请求，使用共享 schema 约束响应。
- CloudBase 是目标生产方向；本地开发默认 mock，必要时切换 HTTP 或 CloudBase function 联调。

前端 UI 规范：

- 微信小程序端新增页面、组件、表单、弹窗、按钮、列表、导航栏、反馈提示等 UI 时，优先使用 TDesign MiniProgram 已有组件。
- 不要随意引入其他小程序 UI 组件库；确有明确理由时，必须同步更新 `AGENTS.md`、`docs/ui-guidelines.md` 和相关开发说明。
- `apps/mobile` 的自定义组件应尽量基于 TDesign MiniProgram 的组件能力、视觉语言和交互风格扩展，避免破坏整体视觉一致性。
- Web 管理端继续按现有 Vue 3 + Element Plus 规范开发，不把小程序组件库要求套用到 `apps/admin`。

## 6. API 与数据约定

接口契约是跨端约束，不要随意修改。新增或变更 API 时，按以下顺序检查并同步更新：

1. `packages/shared/src/schemas/*`
2. `packages/shared/src/contracts/*`
3. `packages/shared/src/contracts/paths.ts`
4. `apps/api/src/routes/*`
5. `apps/api/src/providers/*`
6. `packages/shared/src/client.ts`
7. `apps/admin/src/api/client.ts` 或 `apps/mobile/src/api/client.ts` 中的使用方
8. `docs/已实现API接口清单.md`
9. 相关测试

HTTP 响应 envelope：

- 成功：`{ success: true, data, requestId }`
- 失败：`{ success: false, error: { code, message, details }, requestId }`
- 请求校验失败通常返回 `400` 和 `VALIDATION_ERROR`。
- 未登录 / 无权限分别使用 `401` / `403` 语义。

认证与 actor：

- 本地 mock actor 通过请求头 `x-mock-user-id` 传递。
- `apps/api/src/lib/auth.ts` 负责解析 actor 和角色校验。
- 不要把 mock actor 机制误当作生产认证方案。

字段命名：

- 当前数据字段大量使用 snake_case，例如 `_id`、`community_id`、`name_zh`、`name_en`、`cover_url`。
- 中英双语正式内容通常维护 `_zh` / `_en` 字段；UGC 保留用户原语言。
- 不要仅为前端便利随意改字段名。需要改名时必须更新 schema、contract、client、调用方、文档和测试。

Places 字段边界：

- `GET /places` 是 public list v1，返回卡片字段和分页 envelope，不返回详情专用字段。
- `GET /places/map-markers` 只返回 marker-safe 字段，不应包含完整详情、完整地址、图库等重字段。
- `GET /places/:id` 返回详情字段，包括 `gallery_urls`、`navigation`、`share` 等。
- public places 只应展示 `status=published` 且属于目标 `communityId` 的地点。
- 非法 query，例如不支持的 `sort`，应返回 `400`。

## 7. 测试与验证流程

文档改动通常不需要运行代码测试，但必须检查内容是否与当前仓库事实一致。代码改动按影响范围验证：

- 通用 TypeScript 改动：运行相关包 `typecheck`，必要时运行 `pnpm typecheck`。
- 共享 schema / contract / client 改动：运行 `pnpm test`，重点看 `packages/shared/test`。
- API 路由或 provider 改动：运行 `pnpm test`，重点看 `apps/api/test`。
- Admin UI 改动：运行 `pnpm --filter @community-map/admin typecheck`，并启动 Admin 手动验证关键页面。
- Mobile UI 改动：运行 `pnpm --filter @community-map/mobile typecheck`，并启动 H5 或小程序开发模式验证关键页面。
- OpenSpec 变更：运行 `openspec validate <change-id> --strict --no-interactive`。

关键回归场景：

- Admin 创建 / 更新地点后，Mobile public list 和 detail 表现正确。
- `published` / `draft` 状态正确影响公开可见性。
- Places list 不泄露详情专用字段。
- Map markers 只返回 marker-safe 字段。
- 地图摘要卡不触发不必要的 detail fetch。
- 从地图或列表进入详情页时命中正确 place id。
- 详情页导航字段、经纬度和腾讯地图相关字段保持可用。
- 非法 query 返回 `400`，错误 envelope 符合约定。
- 活动报名、票据、核销流程在相关改动后可回归。
- discover 发帖、评论、审核流程在相关改动后可回归。

## 8. Agent 工作规范

开始任务前：

- 先读本文件，再读 `README.md`、`openspec/project.md` 和任务相关文档。
- 对涉及 API、数据模型、状态机或字段边界的任务，先读 `packages/shared` 中相关 schema、contract、paths、types 和调用方。
- 对涉及 Places 的任务，重点检查 public list、map markers、detail 的字段边界。
- 对涉及 OpenSpec 的任务，阅读对应 `openspec/changes/<change-id>/proposal.md`、`design.md`、`tasks.md` 和 specs。

修改时：

- 优先最小必要改动，保持现有架构和命名风格。
- 不要大规模重构无关代码。
- 不要手改生成目录、依赖目录或既有 OpenSpec 验证 run folder。
- 不要随意改变 API contract、字段名、响应 envelope、状态枚举或 provider 行为。
- 涉及微信小程序 UI 时，先查 `docs/ui-guidelines.md`，优先采用 TDesign MiniProgram；不要为单个页面临时引入另一套 UI 组件库或视觉体系。
- 修改 API、数据模型、状态机、配置或环境变量时，同步更新相关文档和测试。
- 遇到不确定业务规则时，明确标注 Assumptions，不要把猜测写成事实。

完成任务后，最终报告必须包含：

- 修改内容。
- 影响范围。
- 已运行的测试或未运行测试的原因。
- 潜在风险或 Assumptions。

## 9. Assumptions

- 根目录 `AGENTS.md` 是本仓库当前主 AI agent 指南。
- 当前项目范围仍是成都桐梓林单社区，不引入多租户平台化约定。
- CloudBase 与腾讯地图是目标生产方向；本地开发默认 mock。
- `claude.md` 是兼容性说明，不是独立执行流程来源。
