# 桐梓林社区地图阶段演示 Runbook

日期：2026-06-14
适用范围：当前仓库本地阶段演示
关联进度简报：`docs/progress/2026-week-24/progress-brief.md`

## 1. 演示目标

本次演示重点证明项目已经具备阶段性闭环：

- 前台 Mobile H5 已具备首页、活动、发现、地点列表、地点地图、地点详情等主要入口。
- 后台 Admin 已具备活动、帖子、地点、公告、文件、日志等轻量维护入口。
- API/BFF 已注册 31 个接口，覆盖认证、活动、发现、地点、公告、通知、文件和健康检查。
- Places 是当前最完整主线，可演示“后台维护地点 -> 前台列表/地图/详情展示 -> 导航与分享入口”的产品链路。
- Week 8 repo-side Places CloudBase 集成与志愿者点位导入代码已就绪；CloudBase 真实开发环境部署与 `/api` route 验证仍需在账号登录后完成。

## 2. 建议演示结构

总时长建议控制在 20-30 分钟。

| 环节 | 时长 | 内容 |
| --- | ---: | --- |
| 开场说明 | 2 分钟 | 项目目标、当前阶段、演示边界 |
| 本地三端启动 | 5 分钟 | API、Admin、Mobile H5 启动与健康检查 |
| 前台体验演示 | 7 分钟 | 首页、活动、发现、地点列表、地图、详情 |
| 后台维护演示 | 7 分钟 | 地点管理、活动管理、帖子治理、公告/文件/日志入口 |
| 完整提交链路 | 5 分钟 | 后台新增或编辑地点，前台刷新查看效果 |
| 工程交付演示 | 4 分钟 | 测试命令、git diff/status、commit/PR 话术 |

## 3. 演示前准备

确认环境：

```bash
corepack enable
node --version
pnpm --version
pnpm install
```

推荐先运行基础验证：

```bash
pnpm typecheck
pnpm test
pnpm lint
```

如只需要快速演示，至少运行：

```bash
pnpm --filter @community-map/api typecheck
pnpm --filter @community-map/admin typecheck
pnpm --filter @community-map/mobile typecheck
```

## 4. 启动本地演示环境

### 4.1 启动 API

终端 1：

```bash
pnpm dev:api
```

默认地址：

- `http://localhost:8787`
- 健康检查：`http://127.0.0.1:8787/health`

健康检查：

```bash
curl http://127.0.0.1:8787/health
```

### 4.2 启动后台 Admin

终端 2：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/admin dev
```

默认地址：

- `http://localhost:5173`

推荐优先打开：

- `http://localhost:5173/places`
- `http://localhost:5173/events`
- `http://localhost:5173/posts`

### 4.3 启动前台 Mobile H5

终端 3：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5
```

默认地址：

- `http://localhost:5174`

推荐优先打开：

- `http://localhost:5174`
- `http://localhost:5174/#/pages/places/index`
- `http://localhost:5174/#/pages/places/map`
- `http://localhost:5174/#/pages/places/recommended`

### 4.4 微信小程序端可选演示

如需要展示小程序构建链路：

```bash
pnpm dev:mobile:mp
```

当前小程序端 UI 规范以 TDesign MiniProgram 为主，具体规范见 `docs/ui-guidelines.md`。

## 5. 前台演示脚本

### 5.1 首页

演示入口：`http://localhost:5174`

讲解重点：

- 首页已经串联活动、地点、公告和个人入口。
- 当前默认可使用 mock 或本地 HTTP API 数据，适合阶段演示与联调。
- 前台定位是居民和外籍居民的信息入口。

### 5.2 活动模块

演示路径：

1. 进入活动列表。
2. 打开活动详情。
3. 展示报名入口、活动信息、联系信息和我的报名入口。

讲解重点：

- 活动接口已覆盖列表、详情、报名、我的报名、票据和后台核销。
- 当前适合展示活动浏览和报名链路，真实线上权限与支付类能力不在本阶段范围。

### 5.3 发现模块

演示路径：

1. 进入社区发现列表。
2. 打开帖子详情。
3. 展示发帖入口和评论/举报相关入口。

讲解重点：

- Discover 已覆盖帖子列表、详情、发帖、评论、举报和后台治理接口。
- 当前重点是社区内容流基础闭环。

### 5.4 地点模块主线

演示路径：

1. 打开地点地图：`http://localhost:5174/#/pages/places/map`
2. 查看地图 marker 摘要与地点入口。
3. 打开地点列表：`http://localhost:5174/#/pages/places/index`
4. 使用分类、推荐、关键字等筛选入口。
5. 打开地点详情。
6. 展示图集、地址、导航、收藏、分享入口。

讲解重点：

- Places 是当前最完整链路。
- `GET /places` 是 public list，只返回卡片字段，不泄露详情专用字段。
- `GET /places/map-markers` 只返回 marker-safe 字段。
- `GET /places/:id` 返回详情字段，包括图集、导航和分享数据。
- public places 只展示 `status=published` 且属于目标社区的地点。
- 本地浏览器模式可能提示 `Map key not configured.`，这是环境配置问题，腾讯地图 key 不应硬编码进仓库。

## 6. 后台演示脚本

演示入口：`http://localhost:5173`

### 6.1 地点管理

推荐作为后台主线。

演示动作：

1. 打开 `http://localhost:5173/places`。
2. 查看地点列表、发布状态、推荐状态、导入审核提示。
3. 新建一个演示地点，建议使用以下字段：
   - 中文名：`演示社区服务点`
   - 英文名：`Demo Community Service Point`
   - 分类：选择当前表单支持的有效分类
   - 状态：`published`
   - 推荐：可开启
   - 坐标：使用一个有效经纬度
   - 简介：填写中英文一句话说明
4. 保存后回到 Mobile H5 地点列表和地图刷新查看。

讲解重点：

- 后台地点维护通过 `POST /admin/places` 和 `PATCH /admin/places/:id` 进入统一 API。
- 前后台共享 schema、contract 和 client，不在 app 内重复定义 DTO。
- 志愿者导入记录会保留 admin-only `import_review` 元数据，public payload 不返回原始采集证据或审核备注。

### 6.2 活动管理

演示动作：

1. 打开 `http://localhost:5173/events`。
2. 展示活动列表、创建/更新、审核、核销相关入口。

讲解重点：

- 活动管理已具备阶段性管理形态。
- 后续重点是线上权限、真实运营配置和更完整验收。

### 6.3 帖子治理

演示动作：

1. 打开 `http://localhost:5173/posts`。
2. 展示帖子列表和审核治理入口。

讲解重点：

- 发现模块不仅有前台发帖，也有后台治理接口。
- 这是社区内容安全和运营闭环的基础。

### 6.4 公告、文件、日志

演示动作：

1. 打开公告管理。
2. 打开文件回溯。
3. 打开操作日志。

讲解重点：

- 这些入口用于说明后台已经从单一页面扩展为轻量运营台。
- 文件能力当前覆盖上传请求、上传完成记录和私有文件临时访问地址。

## 7. 完整提交演示：后台维护到前台可见

这个环节建议作为“产品闭环”重点展示。

### 7.1 准备

确保三端都使用 HTTP 模式连接同一个本地 API：

- API：`http://127.0.0.1:8787`
- Admin：`VITE_API_MODE=http`
- Mobile：`VITE_API_MODE=http`

### 7.2 演示步骤

1. 在 Admin `Places` 页面新建或编辑一个地点。
2. 设置 `status=published`。
3. 如需在推荐页展示，设置 `is_recommended=true` 并填写推荐理由。
4. 保存。
5. 在 Mobile H5 打开地点列表，刷新确认新地点出现。
6. 打开推荐地点页，确认推荐地点出现。
7. 打开地点详情，确认简介、地址、导航、分享、图集空状态或图集内容渲染正常。
8. 打开地图页，确认有合法坐标的地点出现在 marker 列表中。

### 7.3 验收口径

演示成功标准：

- 后台保存成功，无校验错误。
- 前台列表只展示 published 地点。
- 地点详情能打开正确 id。
- 没有坐标或坐标无效的地点不会污染地图 marker。
- public list/detail/map marker 不展示 `import_review` 等后台审核字段。

## 8. 志愿者点位导入演示

如需要展示 Week 8 数据准备能力，可以执行 dry-run：

```bash
node scripts/places_volunteer_import.mjs \
  --input docs/志愿者点位采集表.xlsx \
  --output /tmp/week8-volunteer-import.json \
  --dry-run
```

讲解重点：

- 当前表格可解析出 19 条可用点位记录。
- 导入结果默认是 `draft`，不会直接公开。
- 原始采集证据和审核备注进入 admin-only `import_review`。
- 公开列表、地图 marker、详情不会返回原始志愿者证据。

如果要通过 Admin API 真正提交到本地 API：

```bash
node scripts/places_volunteer_import.mjs \
  --input docs/志愿者点位采集表.xlsx \
  --api-base-url http://127.0.0.1:8787 \
  --actor-id user_001
```

## 9. 工程交付与 Git 提交演示

### 9.1 展示当前改动

```bash
git status --short
git diff --stat
```

讲解重点：

- 展示本阶段修改涉及哪些模块。
- 强调共享 schema/contract、API provider、前后台页面、文档和测试的同步。

### 9.2 展示质量门禁

推荐演示：

```bash
pnpm typecheck
pnpm test
pnpm lint
```

如果现场时间不足，可以展示最近一次验证记录，并现场跑最相关的命令：

```bash
pnpm --filter @community-map/api typecheck
pnpm --filter @community-map/admin typecheck
pnpm --filter @community-map/mobile typecheck
```

### 9.3 演示提交

提交前先复查：

```bash
git status --short
git diff --stat
```

分批暂存建议：

```bash
git add packages/shared apps/api apps/admin apps/mobile
git add scripts docs openspec auto_test_openspec
git status --short
```

提交信息建议：

```bash
git commit -m "Complete week 8 places integration demo readiness"
```

如果需要推送分支和创建 PR：

```bash
git branch --show-current
git push -u origin "$(git branch --show-current)"
```

PR 描述建议包含：

```text
## Summary
- Complete repo-side Week 8 Places integration readiness.
- Add volunteer point import flow and admin review metadata.
- Keep public places payloads separated from admin-only import evidence.
- Update docs and validation evidence for stage demo.

## Validation
- pnpm typecheck
- pnpm test
- pnpm lint
- Manual browser check: Admin places + Mobile H5 places list/detail/map

## Known Limitations
- CloudBase dev deployment and /api route verification remain deferred until CloudBase auth is available.
- Local H5 map can report missing Tencent map key; key must be configured by environment, not hard-coded.
```

## 10. 演示边界和风险说明

需要主动说明：

- 当前演示以本地 HTTP API 和 mock/local provider 为主。
- CloudBase provider 已有 Places live 基础能力，但 CloudBase dev 环境部署、函数确认和 `/api` route 验证仍未完成。
- 非 Places 模块的完整 CloudBase live provider 仍属于后续工作。
- 腾讯地图 key、CloudBase 环境 ID、生产地址和任何密钥都不应硬编码。
- 当前仓库没有完整浏览器 E2E 自动化套件，跨端验收仍以手动或 MCP 驱动联调为主。

## 11. 推荐收尾话术

当前阶段已经完成从信息入口到运营维护的基础闭环：居民端能浏览活动、发现内容和地点信息，后台能维护核心内容，API 层已经把主要业务接口和契约整理出来。Places 模块已经具备最完整的演示价值，可以展示后台维护、前台列表、地图、详情、导航和分享入口。下一阶段重点是 CloudBase 真实环境联调、非 Places 模块 live provider 补齐、权限与上线验收。
