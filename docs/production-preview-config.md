# 生产预览配置

日期：2026-07-09

本文记录 `production-readiness-acceptance` 和公开发布闭环使用的生产预览配置。

## 如何使用

1. 构建小程序公开审核包前，按本文确认目标环境、函数名和上传路径。
2. 上传微信审核时，只使用 `apps/mobile/dist/build/mp-weixin`。
3. 根目录 `project.config.json` 只用于开发调试，不作为公开审核上传入口。
4. 发布前运行产物扫描，确保包内没有本地端点、mock header 或 fixture media。

## 小程序构建

- canonical WeChat DevTools import path：`apps/mobile/dist/build/mp-weixin`。
- `project.config.json is development-only`，因为它指向 `apps/mobile/dist/dev/mp-weixin/`；它 is not the public-review upload path。
- API mode：`cloudbase-function`。
- API target：`https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`。
- CloudBase environment：`cloud1-d7gxdk8t43bd639c0`。
- Cloud function：`community-map-api`。

生产预览小程序构建产物不能请求本地 API endpoint，例如 `localhost`、`127.0.0.1`、局域网 IP，也不能包含 fixture event media，例如 `https://example.com/public/events/...`。

CloudBase function 模式下，如果 `wx.cloud.uploadFile` 不可用，媒体上传必须直接报配置错误，不得回退到本地或 HTTP mock 上传地址。

## 媒体 URL

- CloudBase live 数据中的活动和地点媒体应通过 CloudBase storage file ID 与临时 URL 解析。
- `https://example.com/public/events/...` 只允许出现在本地 mock/test fixtures，不能出现在生产预览构建产物。
- 外部 POI 图片候选被采用时必须保留 attribution metadata。

## 地图与域名配置

- 服务端地图密钥只配置在 API 或 CloudBase 函数环境：
  - `TENCENT_MAP_KEY`
  - `TENCENT_MAP_SECRET_KEY`
  - `AMAP_WEB_SERVICE_KEY`
- 这些密钥不能作为前端 `VITE_` 变量暴露。
- 微信小程序合法域名在真机公开预览前必须包含 CloudBase API 网关域名：
  - `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com`
- 发布前，必须在微信小程序后台审核 CloudBase storage 域名和所有已发布内容使用的外部媒体域名。

## 剩余平台依赖

| 依赖 | 负责人 | 状态 |
| --- | --- | --- |
| 微信小程序合法 request/download 域名 | Account owner | 公开发版 blocker，必须配置并完成真机验证 |
| 微信账号认证 / 分享能力 | Account owner | 如果真机原生分享不可用，会阻塞最终分享验收 |
| CloudBase 生产身份替换 | Backend/account owner | 公开发版 blocker，见 `docs/production-acceptance-identity.md` |
| 地图权限和原生导航行为 | QA / account owner | 需要 OpenSpec GUI bundle 下的真机证据 |
| 生产媒体清理 | Content operator | 已发布 live content 不能依赖 mock fixture media |
