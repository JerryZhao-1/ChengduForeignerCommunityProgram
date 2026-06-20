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

### 1. 运行后台管理端

默认使用 mock client。

```bash
pnpm dev:admin
```

默认地址：

- `http://localhost:5173`

使用 mock 管理员测试号时：

```bash
VITE_MOCK_ACTOR_ID=admin pnpm dev:admin
```

如果你要让后台走真实 HTTP API，而不是 mock：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev
```

### 2. 运行移动端 H5

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

### 3. 运行微信小程序开发模式

```bash
pnpm dev:mobile:mp
```

微信小程序端 UI 组件库默认使用 TDesign MiniProgram，规范入口见 `docs/ui-guidelines.md`。新增小程序页面、表单、弹窗、按钮、列表、Toast、Tab、空状态和加载状态时，应优先使用或参考 TDesign MiniProgram。

### 4. 运行 API

标准开发命令：

```bash
pnpm dev:api
```

默认地址：

- `http://localhost:8787`

CloudBase 函数框架开发命令：

```bash
pnpm --filter @community-map/api dev:cloudbase
```

健康检查：

```bash
curl http://127.0.0.1:8787/health
```

说明：

- `apps/admin` 和 `apps/mobile` 默认都会退回到 mock 模式。
- 要做联调，除了启动 API，还需要显式设置 `VITE_API_MODE=http` 和 `VITE_API_BASE_URL=http://127.0.0.1:8787`。
- 当前仓库没有成型的浏览器自动化 E2E 套件，跨端验收主要依赖手动或 MCP 驱动的联调。

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
