---
name: discover-seven-day
overview: 基于 docs 与当前代码进度，为 discover 负责人制定 7 天冲刺计划。目标是在 mock/HTTP 联调条件下，把 Discover Tab 从占位壳推进到基本可正式试用的 v1，并明确需要集成 owner 配合的契约与后端事项。
todos:
  - id: day1-scope
    content: 冻结 Discover v1 范围、验收清单，并协调 report/comment/visibility 契约问题
    status: pending
  - id: day2-feed
    content: 产品化 discover 内容流列表：搜索、分页、状态、卡片信息
    status: pending
  - id: day3-create
    content: 完善发帖页表单、校验、提交后跳转和非占位文案
    status: pending
  - id: day4-detail-comments
    content: 完善详情页展示和评论提交/评论列表接入策略
    status: pending
  - id: day5-report-governance
    content: 接入举报入口并与后台隐藏治理做 HTTP 联调
    status: pending
  - id: day6-ui-i18n
    content: 补齐 i18n、TDesign 风格与 H5/小程序显示一致性
    status: pending
  - id: day7-acceptance
    content: 完成回归、验证命令和交付说明
    status: pending
isProject: false
---

# Discover 七天交付计划

## 当前判断

`discover` 当前已具备最小接口和页面骨架，但还不是可正式投用状态。已存在的基础包括：

- 前台三页：[apps/mobile/src/pages/discover/index.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/index.vue)、[apps/mobile/src/pages/discover/detail.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/detail.vue)、[apps/mobile/src/pages/discover/create.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/create.vue)
- 已实现 API：`GET /discover/posts`、`GET /discover/posts/:id`、`POST /discover/posts`、`POST /discover/posts/:id/comments`、`POST /discover/posts/:id/report`、`POST /admin/discover/posts/:id/moderation`
- 共享契约入口：[packages/shared/src/contracts/discover.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/packages/shared/src/contracts/discover.ts)、[packages/shared/src/schemas/discover.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/packages/shared/src/schemas/discover.ts)、[packages/shared/src/client.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/packages/shared/src/client.ts)

主要缺口是：列表页无产品级状态与筛选，发帖表单不完整，详情页无评论列表/举报入口/图片标签展示，`reportPost` 未暴露到 shared client，评论列表没有 GET API，CloudBase posts/comments 仍是 pending。

## 七天目标

七天内不要追求完整生产后端，而是完成一个可真实试用的 Discover v1：用户可以浏览内容流、搜索/筛选帖子、发布较完整的帖子、进入详情、发表评论、举报内容，并在 mock/HTTP 模式下稳定联调。CloudBase live provider、生产登录、完整后台治理、我的帖子端到端、完整图片云存储联调作为后续集成事项。

## 每日安排

### Day 1：冻结 v1 范围与验收口径

- 阅读并确认 discover 相关契约、页面和 mock 行为：[packages/shared/src/mock/service.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/packages/shared/src/mock/service.ts)、[apps/api/src/routes/discover.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/api/src/routes/discover.ts)、[docs/已实现API接口清单.md](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/docs/已实现API接口清单.md)
- 和集成 owner 对齐三项必须配合的小改动：补 `reportPost` client、确认 hidden/deleted 是否应从公开列表过滤、确认评论列表是详情内嵌还是新增 GET comments API
- 产出一份 Discover v1 验收清单，聚焦：列表、搜索、发帖、详情、评论、举报、空态/错误态、H5 与小程序构建

### Day 2：内容流列表产品化

- 重做 [apps/mobile/src/pages/discover/index.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/index.vue)
- 补 loading、empty、error、重试、分页加载、关键词搜索
- 展示已有字段：标题、正文摘要、标签、位置、图片缩略图、语言、作者占位或 mock 作者
- 对齐项目已有模式，优先参考 [apps/mobile/src/components/AsyncStateCard.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/components/AsyncStateCard.vue)、[apps/mobile/src/pages/places/index.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/places/index.vue)

### Day 3：发帖页补成可用表单

- 重做 [apps/mobile/src/pages/discover/create.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/create.vue)
- 表单字段至少包含：标题、正文、语言、标签、位置文本
- 图片能力分两档：先支持 `image_urls` 手动/模拟输入或 mock 预览；若 files 流已稳定，再接上传请求
- 表单校验：标题、正文、至少一个标签；提交中禁用按钮；成功后跳转详情或返回列表并刷新
- 去掉“占位”“草稿帖”等不适合正式试用的文案

### Day 4：详情页与评论体验

- 重做 [apps/mobile/src/pages/discover/detail.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/pages/discover/detail.vue)
- 展示帖子完整内容、图片、标签、位置、语言、状态提示
- 评论区先按已有能力实现发表评论成功反馈；如果 Day 1 协调完成评论读取契约，则加入评论列表与发评后刷新
- 如果评论列表 API 当周无法补齐，明确在 UI 中保留“评论已提交，列表展示待后端接口接入”的低风险交互，不阻塞主链路

### Day 5：举报、治理联动与边界状态

- 在详情页加入举报入口，配合 shared client 暴露 `reportPost`
- 举报表单至少包含原因与补充说明；提交后提示“已提交给社区管理员处理”
- 和 admin 当前 [apps/admin/src/pages/PostsPage.vue](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/admin/src/pages/PostsPage.vue) 做一次 HTTP 联调：后台隐藏后，前台公开列表/详情应按约定处理
- 补齐空列表、隐藏帖、404、不合法 id、网络失败的用户提示

### Day 6：i18n、UI 规范与小程序体验

- 将 discover 文案沉淀到 [apps/mobile/src/i18n/copy.ts](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/apps/mobile/src/i18n/copy.ts)，对齐 `useAppStore` 的语言模式
- 按 [docs/ui-guidelines.md](/Users/a011/Documents/GitHub/ChengduForeignerCommunityProgram/docs/ui-guidelines.md) 统一按钮、输入框、Toast、加载、空态、列表卡片视觉
- 在 H5 与微信小程序构建下检查页面样式，避免只在浏览器里看起来可用

### Day 7：回归、缺陷修复与交付说明

- 跑通完整手工路径：列表加载、搜索、分页、发帖、详情、评论、举报、后台隐藏联动
- 执行最低验证：`corepack pnpm --filter @community-map/mobile typecheck`、`corepack pnpm --filter @community-map/mobile build:h5`、必要时 `corepack pnpm test`
- 输出交付说明：已完成能力、未完成依赖、需要集成 owner 后续补的 API/CloudBase 项、已知限制

## 必须协调的事项

- `packages/shared/src/client.ts` 需要暴露 `discover.reportPost`，否则前台无法通过统一 client 调举报接口。
- 评论列表需要产品和后端确认：要么 `GET /discover/posts/:id/comments`，要么 `GET /discover/posts/:id` 返回 comments。
- 公开列表需要明确过滤规则：`hidden` / `deleted` / `reported` 是否可见。建议至少隐藏 `hidden` 和 `deleted`。
- CloudBase `posts`、`comments` 集合和 live provider 不作为本七天主目标，但必须记录为后续集成风险。

## 七天结束的验收标准

- Discover Tab 在 mock/HTTP 模式下可完成“浏览 → 搜索 → 发帖 → 详情 → 评论 → 举报”的主链路。
- 页面不再出现明显占位文案，具备 loading、empty、error、提交中、成功/失败反馈。
- 发帖表单字段与当前 shared contract 对齐，不在页面内私自定义核心 DTO。
- H5 构建通过，mobile typecheck 通过；若 shared/api 有改动，相关 `pnpm test` 通过。
- 交付说明清楚标注：评论列表、CloudBase live provider、真实登录、完整图片上传、我的帖子等后续依赖。