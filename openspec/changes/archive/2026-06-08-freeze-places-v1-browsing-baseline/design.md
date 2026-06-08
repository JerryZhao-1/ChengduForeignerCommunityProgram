# Design: Freeze places v1 browsing baseline

## Context

仓库已经存在 `places` 的共享 schema、mock 数据、Koa 路由、CloudBase handler 和移动端页面，但它们还没有形成稳定的浏览侧真相：

- `list/detail/map-markers` 已有雏形，但 contract 还没有被明确冻结
- `CloudBase provider` 当前不可用，导致 handler 无法代表真实查询基线
- 移动端 `loading/empty/error` 与 locale 文案在页面内重复定义
- 推荐位入口仍以独立页面存在，不符合本次 v1 三页骨架目标

## Design Decisions

### 1. Freeze contract by surface

将 `places` v1 公共浏览面固定成三个读取 surface：

- `list`: 卡片型分页结果，支持 `page`、`pageSize`、`communityId`、`keyword`、`category`、`tags`、`recommended`、`sort`
- `detail`: 决策信息完整体，包含图集、标签、营业时间、地址、简介和导航对象
- `map-markers`: 地图轻量对象，只包含 marker 所需字段，不复用详情结构

### 2. Keep backend semantics identical

`mock provider`、`Koa routes`、`CloudBase handler`、`CloudBase provider` 对 `places` public read 使用同一套语义：

- 只暴露 `published`
- 只暴露当前 `communityId`
- `tags` 采用全匹配
- `recommended` 为显式过滤
- `sort` 仅支持 `recommended` 和 `name`
- `detail` 对未发布或不存在地点统一返回 404

本次 CloudBase provider 只补公共读取基线，不把 admin places 写入流纳入实现范围。

### 3. Collapse browsing UI to three pages

正式浏览页只保留：

- `pages/places/index`
- `pages/places/map`
- `pages/places/detail`

独立 `recommended` 页面仅作为兼容跳转层保留，统一重定向到 `list?recommended=true&sort=recommended`。

### 4. Centralize status and locale copy

将状态展示和页面 copy 下沉到共享层：

- 通用 `AsyncStateCard` 负责 `loading/empty/error`
- `usePlaceAsyncState` 负责异步加载状态
- `pages/places/copy.ts` 集中管理 zh/en 文案
- 页面只保留字段级 `pickLocalized`

## Risks And Guardrails

- CloudBase provider 目前没有真实数据库接入；本次目标是让 cloudbase 执行路径具备与 mock 对齐的浏览基线，而不是完成正式落库实现。
- 现有大 change 仍处于 active 状态，后续实现更大范围时必须避免继续扩展“独立推荐页”这条冲突路线。
