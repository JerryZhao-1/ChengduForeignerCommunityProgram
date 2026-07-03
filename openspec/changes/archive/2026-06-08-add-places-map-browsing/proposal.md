# Change: Add places map browsing

## Why

当前 `places` 列表页和详情页已存在，但地图页仍是占位实现，无法在真实地图上浏览社区地点，也无法完成点位点击和导航跳转。

## What Changes

- 在小程序端将地点地图页从占位列表升级为真实地图浏览页
- 支持加载地点 marker、点击 marker 查看地点并跳转详情
- 在地点详情页提供真实导航跳转能力
- 为地图 marker 增加独立的共享 schema / contract，避免继续复用完整 Place 返回体

## Impact

- Affected specs: `places-map-browsing`
- Affected code: `packages/shared`、`apps/api`、`apps/mobile/src/pages/places`
