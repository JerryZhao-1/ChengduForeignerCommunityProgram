# 移动端 Discover 与 Profile 前端现状

本文档记录 `apps/mobile`（uni-app + Vue 3 + TypeScript，微信小程序为主要目标端）中
`discover`（社区内容流）与个人主页（`profile`）相关前端的当前实现状态，便于其他
AI agent 或协作者快速理解现状、边界与后续可扩展点。

> 更新时间：2026-07（对应 `discover` 分支的一轮前端交互迭代）

## 1. 范围与总体说明

- 本轮工作聚焦“前端交互与页面搭建”，未新增或改动后端 API 契约。
- 数据来源仍以 mock / 本地态为主：
  - 帖子列表 / 详情：来自统一 API client（`mobileApi.discover.*`），默认 mock provider。
  - 点赞、收藏、关注、评论、转发计数、私信、个人资料编辑：**当前均为前端本地态或本地存储**，
    尚无对应后端持久化接口。
- 所有新增 UI 优先使用现有视觉风格；小程序端遵循 `docs/ui-guidelines.md`
  （TDesign MiniProgram 优先）。本轮以页面级自定义视图为主，未引入新的 UI 组件库。

## 2. 页面与文件清单

| 功能 | 文件 | 说明 |
| --- | --- | --- |
| 内容流首页 | `apps/mobile/src/pages/discover/index.vue` | 帖子列表、搜索入口、个人主页入口、发帖入口 |
| 帖子详情 | `apps/mobile/src/pages/discover/detail.vue` | 媒体轮播、作者信息与关注、评论、底部固定操作栏、更多菜单、转发面板 |
| 发帖 | `apps/mobile/src/pages/discover/create.vue` | 发帖表单（既有） |
| 搜索 | `apps/mobile/src/pages/discover/search.vue` | 搜索页（既有） |
| 举报 | `apps/mobile/src/pages/discover/report.vue` | 举报表单，完成按钮置于标题左侧 |
| 个人主页 | `apps/mobile/src/pages/more/profile.vue` | 通用社区风格主页（非 Instagram 品牌化） |
| 编辑资料 | `apps/mobile/src/pages/more/profile-edit.vue` | 头像 / 昵称 / 用户名 / 简介编辑，保存到本地存储 |
| 媒体工具 | `apps/mobile/src/pages/discover/media.ts` | 帖子媒体解析辅助（`getFirstMedia` 等） |
| 本地资料覆盖 | `apps/mobile/src/stores/profile-store.ts` | 当前用户资料的本地覆盖存储（`uni.setStorageSync`） |
| 文案 | `apps/mobile/src/i18n/copy.ts` | 中英双语 UI 文案 |
| 路由 | `apps/mobile/src/pages.json` | 新页面路由注册（`profile`、`profile-edit` 使用 custom 导航） |

## 3. Discover 首页（index.vue）

- 顶部操作区（`top-actions`，位于状态栏下方、左对齐，避开小程序右上角胶囊按钮）：
  - **个人主页入口**：圆形头像按钮，点击进入当前用户自己的主页（`/pages/more/profile`，不带 `id`）。
    - 头像来源优先级：本地资料覆盖 `avatarUrl` → `mobileApi.auth.me()` 的 `avatar_url` → 兜底占位（“我”）。
    - 在 `onLoad` 与 `onShow` 均会刷新头像，从编辑资料返回后即时更新。
  - **搜索入口**：圆形放大镜按钮，点击进入搜索页。
- 列表：分页加载、下拉刷新、触底加载更多。
- 发帖入口：面板内主按钮进入发帖页。

## 4. 帖子详情页（detail.vue）

- **媒体展示**：多图 / 视频使用 `swiper` 横向轮播，单屏显示一项，底部半透明指示点，当前项高亮。
- **作者信息**：头像 + 昵称，右侧“关注”按钮（本地态切换，无后端）。头像 / 昵称可点击进入作者主页。
- **更多菜单**：标题旁三点按钮，点击弹出 `uni.showActionSheet`，含“举报”入口（原本在导航栏，已移除）。
- **评论**：
  - 含 mock 评论数据，每条评论带 `authorId`，头像与昵称可点击进入对应用户主页。
  - 每条评论右侧有小爱心点赞（本地态，小红书风格）与三点更多菜单。
- **底部固定操作栏（`comment-bar`）**：
  - 左侧为评论输入框，点击后随键盘上移（`@keyboardheightchange` + `translateY`）。
  - 右侧集成点赞、收藏、转发图标与计数（均为本地态 / mock 计数）。
- **转发**：点击转发图标弹出微信经典样式的底部转发面板；配合 `onShareAppMessage` /
  `onShareTimeline`，分享链接可直达对应帖子详情（带帖子 `id`）。

## 5. 个人主页（profile.vue）

- 通用社区风格（绿色 / 青色主题），非 Instagram 品牌化。
- 结构：自定义导航（返回 + 用户名）、封面区（头像、昵称、`@handle`、社区标签、简介）、
  操作按钮区、统计卡（帖子 / 粉丝 / 关注）、Tab（帖子 / 视频）、内容网格。
- 通过 `?id=<userId>` 区分查看对象；不带 `id` 时为当前用户自己的主页（`isSelf`）。
- 操作按钮：
  - 自己：`编辑资料`（进入 `profile-edit`）、`分享主页`（复制主页链接）。
  - 他人：`关注`/`已关注`（本地态）、`发消息`（当前为“私信功能开发中”提示，
    **不再错误地复制链接**）。
- 帖子来源：`mobileApi.discover.listPosts` 后按 `author_user_id === targetUserId` 过滤。
- 资料展示会叠加本地覆盖（见第 7 节），`onShow` 时刷新，编辑保存后返回即时生效。
- `userProfiles` 为页面内 mock 资料表（Jerry / Emma / 李雷 / Sophie），
  用于粉丝数、简介等展示，尚无后端用户资料接口。

## 6. 编辑资料页（profile-edit.vue）

- 参考主流社交平台的资料编辑表单：顶部居中头像 + “更换头像”，下方昵称 / 用户名 / 简介行。
- 保存按钮置于自定义导航标题右侧（避开右上角胶囊）。
- 预填顺序：本地覆盖 → `mobileApi.auth.me()`（昵称、头像）。
- 头像通过 `uni.chooseImage` 选择，暂存为临时路径写入本地覆盖。
- 保存写入 `profile-store`，`showToast` 后返回上一页。

## 7. 本地资料覆盖存储（profile-store.ts）

- 存储键：`profile-overrides-v1`，结构为 `{ [userId]: { name, handle, bio, avatarUrl } }`。
- 用途：在没有后端用户资料更新接口的情况下，让“编辑资料”即时生效并跨页面（主页、Discover 头像）复用。
- 读写接口：`getProfileOverride(userId)`、`setProfileOverride(userId, override)`。
- **注意**：这是纯前端本地态，卸载 / 清缓存后丢失，不代表后端真实数据。

## 8. 已知边界与后续可接入点

以下能力目前为前端本地态 / mock，后续如需真实闭环，应按仓库“契约优先”流程
（`packages/shared` schema/contract → `apps/api` route/provider → client → 文档 → 测试）接入：

- 点赞 / 收藏 / 关注 / 转发计数的读写与持久化。
- 评论列表与发布（当前评论含 mock 数据）。
- 用户资料读取与更新（昵称、头像上传、简介、`@handle`）。
- 私信 / 发消息（当前仅占位提示）。
- 主页粉丝 / 关注数、关注关系。

## 9. 验证方式

- 类型检查：`pnpm --filter @community-map/mobile typecheck`。
- 小程序端联调：`pnpm dev:mobile:mp` 后在微信开发者工具打开 `dist/dev/mp-weixin`，
  必要时清缓存并重新编译。
- H5 端：`pnpm --filter @community-map/mobile dev:h5`。
