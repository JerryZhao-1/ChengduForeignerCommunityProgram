# Discover 七天前端交付计划

## 当前判断

后端由统一团队开发，你这 7 天的工作重点应放在 `discover` 前台页面、接口消费、联调验收和体验打磨，不再把 shared contract、API route、CloudBase provider 作为你的开发任务。

当前可直接依赖的后端能力以接口文档为准：

- 本地 API Base URL：`http://127.0.0.1:8787`
- 统一响应 envelope：成功为 `{ success: true, data, requestId }`，失败为 `{ success: false, error, requestId }`
- 本地调试 actor header：`x-mock-user-id`
- Discover 已列入统一后端基础闭环：feed、detail、create、comment、report、admin moderation

Discover 相关接口：

- `GET /discover/posts`：内容流列表，支持 `page`、`pageSize`、`communityId`、`keyword`
- `GET /discover/posts/:id`：帖子详情
- `POST /discover/posts`：创建帖子，字段包括 `title`、`content`、`language`、`tag_ids`、`location_text`、`image_file_ids`、`image_urls`
- `POST /discover/posts/:id/comments`：发表评论
- `POST /discover/posts/:id/report`：举报帖子
- `POST /admin/discover/posts/:id/moderation`：后台治理，由后台/后端同学负责

前台主要入口：

- [apps/mobile/src/pages/discover/index.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/index.vue)
- [apps/mobile/src/pages/discover/detail.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/detail.vue)
- [apps/mobile/src/pages/discover/create.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/create.vue)
- [apps/mobile/src/i18n/copy.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/copy.ts)
- [apps/mobile/src/api/client.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/api/client.ts)

## 七天目标

七天内把 Discover 从“页面骨架”推进到“基本可正式试用的前台 v1”。用户应能在 H5/小程序中完成：

`进入 Discover → 浏览内容流 → 搜索帖子 → 查看详情 → 发帖 → 评论 → 举报 → 看到清晰反馈`

本计划默认后端、OpenAPI、Postman、Admin moderation 由统一后端/集成同学负责。你只需要按现有 API 调用、发现问题时提交清晰的问题单和复现路径。

## 每日安排

### Day 1：接口熟悉与前台验收清单

- 用 API 手册和 Postman 文档确认 Discover 请求字段、响应字段、错误 envelope、`x-mock-user-id` 用法。
- 用本地 HTTP 环境跑通最小链路：`GET /health`、`GET /discover/posts`、`GET /discover/posts/:id`、`POST /discover/posts`、`POST /discover/posts/:id/comments`、`POST /discover/posts/:id/report`。
- 梳理当前三页的真实状态，列出 UI 缺口：loading、empty、error、搜索、分页、表单校验、举报弹层、评论反馈、双语文案。
- 产出前台验收清单，不写后端任务，只记录后端联调问题。

### Day 2：内容流列表产品化

- 重做 `index.vue` 的内容流体验。
- 支持关键词搜索、分页加载、刷新、重试。
- 展示帖子核心字段：标题、正文摘要、语言、标签、位置、图片缩略图、状态提示。
- 补齐 loading、empty、error 三类状态。
- 参考 `places` 页面已有的状态处理和卡片信息密度，让 Discover 不再像占位页。

### Day 3：发帖页可用化

- 重做 `create.vue` 的表单体验。
- 表单字段至少包含：标题、正文、语言、标签、位置文本、图片 URL 或图片占位预览。
- 校验规则：标题必填、正文必填、至少一个标签、语言必选。
- 提交中禁用按钮并显示反馈；提交成功后跳转详情或返回列表刷新。
- 移除“占位”“草稿帖”等不适合试用的文案。

### Day 4：详情页与评论体验

- 重做 `detail.vue` 的帖子详情布局。
- 展示完整正文、图片、标签、位置、语言、举报入口、评论输入区。
- 基于现有 `POST /discover/posts/:id/comments` 完成评论提交体验。
- 如果后端暂未提供评论列表读取，就明确做成“提交成功反馈 + 后续刷新展示待接口支持”的前台降级，不阻塞详情页交付。
- 补齐详情页 404、无 id、网络失败、提交失败的用户提示。

### Day 5：举报与治理联调

- 在详情页加入举报弹层或底部操作区。
- 举报字段对齐接口：`reason` 必填，`description` 可选。
- 成功后提示“已提交给社区管理员处理”，避免用户误以为帖子立即消失。
- 与后端/后台同学做一次联调：用户举报后，后台 moderation 能看到或处理；如果当前后台只支持隐藏，就记录前台可验证路径。
- 验证前台面对 `reported`、`hidden`、`deleted` 等状态时是否有清晰展示或跳转策略。

### Day 6：UI、文案与小程序体验统一

- 将 Discover 页面文案整理到 `copy.ts`，中文/英文至少覆盖主按钮、空态、错误态、表单提示、举报提示。
- 按 `docs/ui-guidelines.md` 对齐 TDesign MiniProgram 风格：按钮、输入框、Toast、列表卡片、空态、加载态。
- 在 H5 与小程序构建下检查样式，重点看输入框、长文本、图片列表、底部按钮、弹层。
- 处理移动端真实体验问题：点击区域、键盘遮挡、返回后列表刷新、重复提交。

### Day 7：完整回归与交付说明

- 完整跑通前台路径：列表加载、搜索、分页、发帖、详情、评论、举报。
- HTTP 联调路径：启动 API 后用 `VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787` 跑 Mobile H5。
- 执行前台验证：`corepack pnpm --filter @community-map/mobile typecheck`、`corepack pnpm --filter @community-map/mobile build:h5`。
- 若本周只改 mobile，不需要主动跑全仓后端测试；如果联调中后端同学改了 shared/API，再由集成同学补跑相关测试。
- 输出交付说明：已完成页面、接口联调结果、仍依赖后端的事项、已知限制、正式试用前注意点。

## 联调命令

启动本地 API：

```bash
pnpm dev:api
```

启动 Mobile H5 HTTP 联调：

```bash
VITE_API_MODE=http \
VITE_API_BASE_URL=http://127.0.0.1:8787 \
pnpm --filter @community-map/mobile dev:h5
```

小程序构建/预览：

```bash
pnpm dev:mobile:mp
```

前台提交前检查：

```bash
corepack pnpm --filter @community-map/mobile typecheck
corepack pnpm --filter @community-map/mobile build:h5
```

## 七天结束的验收标准

- Discover Tab 在 HTTP 模式下可完成“浏览 → 搜索 → 发帖 → 详情 → 评论 → 举报”的主链路。
- 页面不再出现明显占位文案，具备 loading、empty、error、提交中、成功/失败反馈。
- 发帖字段与 API 手册保持一致，不在页面内发明后端不存在的核心字段。
- 举报、评论、发帖失败时都有清晰提示。
- H5 构建和 mobile typecheck 通过。
- 交付说明清楚列出后端统一团队还需确认的事项，例如评论列表读取、CloudBase live acceptance、生产认证、图片上传正式流。