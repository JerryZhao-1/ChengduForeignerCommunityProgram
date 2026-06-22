# Chengdu Foreigner Community Program

一个基于 `pnpm` workspace 的社区项目，当前包含：

- `apps/admin`: 后台管理端，Vue + Vite
- `apps/mobile`: 移动端/H5，uni-app + Vue
- `apps/api`: API 服务，TypeScript
- `packages/shared`: 共享 schema、contract、mock client、测试夹具

## 环境要求

- Node.js `>= 20`
- `pnpm@10.6.5`

推荐用 `corepack`：

```bash
corepack enable
pnpm --version
node --version
```

安装依赖：

```bash
pnpm install
```

## 目录结构

```text
.
├── apps/
│   ├── admin/
│   ├── api/
│   └── mobile/
├── packages/
│   └── shared/
├── openspec/
└── auto_test_openspec/
```

## 如何运行

### 1. 运行 API 后端

本地 BFF / API 默认使用 mock provider，数据保存在当前 Node 进程内存中；重启 API 后，后台新增或修改的演示数据会恢复到初始 mock 数据。

标准开发命令：

```bash
pnpm dev:api
```

默认地址：

- API Base：`http://127.0.0.1:8787`
- Health Check：`http://127.0.0.1:8787/health`

健康检查：

```bash
curl http://127.0.0.1:8787/health
```

如果本机使用 Node 24，并遇到 Koa 依赖链报错：

```text
TypeError: getGeneratorFunction is not a function
```

使用以下兼容启动命令：

```bash
NODE_OPTIONS=--no-experimental-require-module \
pnpm --filter @community-map/api exec tsx src/dev.ts
```

API 已包含本地开发 CORS 处理，支持 Admin / Mobile H5 从 `localhost` 端口访问 `127.0.0.1:8787`。

CloudBase 函数框架开发命令：

```bash
pnpm --filter @community-map/api dev:cloudbase
```

说明：

- `API_PROVIDER=mock` 是默认模式。
- `API_PROVIDER=cloudbase` 会尝试使用 CloudBase provider；CloudBase dev `community-map-api` HTTP function 和 `/api` route 已完成基础 smoke，完整 places live acceptance 仍需导入或创建 live 数据后继续验收。
- 本地演示新增地点时，确保 `status=published`，否则前台 public list 不展示。

### 2. 运行后台管理端

默认使用 mock client。

```bash
pnpm dev:admin
```

默认地址：

- `http://localhost:5173`

如果你要让后台走真实 HTTP API，而不是 mock：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev
```

后台 HTTP 联调地址：

- `http://localhost:5173`
- 地点管理：`http://localhost:5173/places`

### 3. 运行移动端 H5

默认使用 mock client。

```bash
pnpm dev:mobile
```

默认地址：

- `http://localhost:5174`

如果你要让移动端走真实 HTTP API：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5
```

移动端 H5 HTTP 联调地址：

- `http://localhost:5174`
- 地点列表：`http://localhost:5174/#/pages/places/index`
- 地点地图：`http://localhost:5174/#/pages/places/map`
- 推荐地点：`http://localhost:5174/#/pages/places/recommended`

### 4. 运行微信小程序开发模式

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:mp-weixin
```

构建完成后，用微信开发者工具导入：

```text
apps/mobile/dist/dev/mp-weixin
```

绝对路径示例：

```text
/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/dev/mp-weixin
```

小程序联调注意事项：

- 微信开发者工具本地调试 HTTP API 时，通常需要启用“不校验合法域名 / TLS 版本 / HTTPS 证书”。
- 小程序模拟器里使用 `http://127.0.0.1:8787` 访问本机 API；真机预览不能用手机自己的 `127.0.0.1` 访问 Mac，需要改成局域网 IP 或 CloudBase HTTP 函数地址。
- 微信小程序端 UI 组件库默认使用 TDesign MiniProgram，规范入口见 `docs/ui-guidelines.md`。新增小程序页面、表单、弹窗、按钮、列表、Toast、Tab、空状态和加载状态时，应优先使用或参考 TDesign MiniProgram。

说明：

- `apps/admin` 和 `apps/mobile` 默认都会退回到 mock 模式。
- 要做联调，除了启动 API，还需要显式设置 `VITE_API_MODE=http` 和 `VITE_API_BASE_URL=http://127.0.0.1:8787`。
- 当前仓库没有成型的浏览器自动化 E2E 套件，跨端验收主要依赖手动或 MCP 驱动的联调。

### 5. 本地阶段演示启动顺序

推荐三到四个终端分别启动：

```bash
# terminal 1: API
NODE_OPTIONS=--no-experimental-require-module \
pnpm --filter @community-map/api exec tsx src/dev.ts

# terminal 2: Admin
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev

# terminal 3: Mobile H5
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5

# terminal 4: WeChat Mini Program, optional
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:mp-weixin
```

后台新增地点后，前台可见需要满足：

- `status=published`
- 经纬度是有效数字
- 前后台都连接同一个 API：`http://127.0.0.1:8787`
- 如果要展示在推荐筛选中，开启 `is_recommended`

## 常用开发命令

根目录：

```bash
pnpm dev:admin
pnpm dev:mobile
pnpm dev:api
pnpm test
pnpm typecheck
pnpm lint
```

按包运行：

```bash
pnpm --filter @community-map/admin dev
pnpm --filter @community-map/mobile dev:h5
pnpm --filter @community-map/mobile dev:mp-weixin
pnpm --filter @community-map/api dev
pnpm --filter @community-map/shared typecheck
```

## 如何测试

### 1. 运行单元测试

根目录：

```bash
pnpm test
```

当前测试主要覆盖：

- `apps/api/test`
- `packages/shared/test`

如果只想跑 API 测试：

```bash
./node_modules/.bin/vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
```

如果只想跑 shared 测试：

```bash
./node_modules/.bin/vitest run \
  packages/shared/test/contracts.spec.ts \
  packages/shared/test/client.spec.ts \
  packages/shared/test/places-marker-contract.spec.ts
```

### 2. 运行类型检查

全仓：

```bash
pnpm typecheck
```

按包：

```bash
pnpm --filter @community-map/api typecheck
pnpm --filter @community-map/admin typecheck
pnpm --filter @community-map/mobile typecheck
pnpm --filter @community-map/shared typecheck
```

### 3. 运行 lint

```bash
pnpm lint
```

### 4. OpenSpec 校验

如果你在做变更提案或按 OpenSpec 交付：

```bash
openspec validate <change-name> --strict --no-interactive
```

例如：

```bash
openspec validate stabilize-places-map-v1-and-admin-metadata --strict --no-interactive
```

### 5. 手动端到端测试

当前推荐的手动链路：

1. 启动 API。
2. 用 HTTP 模式启动 Admin。
3. 用 HTTP 模式启动 Mobile H5。
4. 在 Admin 创建或编辑数据。
5. 在 Mobile 列表页、地图页、详情页验证公开端表现。

示例：

```bash
# 终端 1
pnpm dev:api

# 终端 2
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev

# 终端 3
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5
```

重点建议验证：

- Admin 创建/更新后，公开列表是否可见
- 地图 marker 是否只返回 marker-safe 字段
- 地图摘要卡是否不触发 detail fetch
- 从地图或列表进入详情页是否命中正确 place id
- `published` / `draft` 状态是否影响公开可见性

## 共享环境变量

Admin 和 Mobile 当前都识别这些环境变量：

- `VITE_API_MODE`
  - `mock`
  - `http`
- `VITE_API_BASE_URL`
  - 默认 `http://localhost:8787`
- `VITE_MOCK_ACTOR_ID`
  - 默认 `user_001`

## 备注

- 根目录存在 `auto_test_openspec/`，用于保存 OpenSpec 验证 bundle。
- 根目录存在 `openspec/`，用于变更提案、设计、任务和规范增量。
- 如果你是在做较大变更，先阅读 [AGENTS.md](/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/AGENTS.md)。
