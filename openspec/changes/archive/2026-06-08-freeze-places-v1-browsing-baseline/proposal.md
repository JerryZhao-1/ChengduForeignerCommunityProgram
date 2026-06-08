# Change: Freeze places v1 browsing baseline

## Why

`places` 已经有初步的 list/detail/map 页面和共享 schema，但当前边界仍然偏松散：推荐位还依赖独立页面，前端状态处理重复分散，CloudBase 路径对 `places` 查询仍不可用，导致公共浏览面还没有稳定的 v1 集成基线。

当前需要先冻结浏览侧 contract，并把后端查询与前端三页骨架收敛成一个可测、可继续迭代的基线，再继续更大的 `places` foundation 工作。

## What Changes

- 冻结 `places` v1 公共浏览 contract，明确 list/detail/map-markers 的请求与返回边界
- 建立 `places` public read 查询基线，确保 mock、Koa、CloudBase handler/provider 语义一致
- 将前端 `places` 公共浏览面收敛为 `list`、`map`、`detail` 三页骨架
- 把推荐位能力并入 `list` 过滤，不再把独立推荐页作为正式 v1 页面
- 统一 `loading`、`empty`、`error` 与 locale 显示处理

## Impact

- Affected specs:
  - `places-public-contract`
  - `places-query-baseline`
  - `places-mobile-skeleton`
- Affected code:
  - `packages/shared/src/**`
  - `apps/api/src/**`
  - `apps/mobile/src/pages/places/**`
  - `apps/mobile/src/components/**`

## Relationship To Existing Changes

- 本 change 明确取代 `complete-places-frontend-and-backend-foundation` 中“独立推荐页承载推荐位入口”的方向。
- 后续若继续推进该大 change，相关 `places` delta 需要先改写为基于本次 v1 浏览基线，而不是继续保留独立推荐页假设。
