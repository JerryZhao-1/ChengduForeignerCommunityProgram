# 公开发布真机验证 Runbook

## 如何使用

1. 使用已经上传或预览的公开审核包执行，不要开启“不校验合法域名 / TLS / HTTPS 证书”或任何 debug 域名绕过。
2. iOS 和 Android 必须分开记录，不能用 DevTools 截图替代真机证据。
3. 每一行都要记录设备、系统、微信版本、包版本、截图/日志路径、result。
4. 失败时必须归类为：代码问题、账号/域名配置问题、设备/平台限制、已接受产品 fallback。
5. 本文中的英文关键词 `screenshots`、`result`、`CloudBase calls` 等会被验证脚本检查，请保留。

Evidence index columns include screenshots and result:

| Platform | Device | OS | WeChat version | Package version | Path | Screenshot/log pointers | Result | Owner notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iOS |  |  |  |  |  | screenshots:  | result:  |  |
| Android |  |  |  |  |  | screenshots:  | result:  |  |

## 必测清单

| 区域 | required evidence |
| --- | --- |
| Home | 首页加载、公告/内容可见、无白屏 |
| Events | 列表、详情、报名、ticket 查看、重复报名或关闭报名的失败态 |
| Discover | 内容流、创建、评论、点赞、收藏、sharing 或已接受 fallback、举报、个人互动状态 |
| Places | 列表、推荐筛选、map、详情、navigation、sharing 或已接受 fallback |
| Me | 登录/会话状态、语言、报名、帖子、评论、举报、点赞、收藏、关注、notifications |
| CloudBase calls | 函数/API 调用成功，有 requestId 或控制台网络证据 |
| legal-domain behavior | 不开启 debug 绕过时 request/upload/download/media 域名可用 |
| map | 腾讯地图展示、marker 点击、导航拉起或 fallback |
| media loading | 地点/活动/帖子媒体从已批准域名加载 |
| upload | 支持的图片上传链路可用，或记录已接受的 launch fallback |
| location permission fallback | 拒绝定位权限后有清晰 fallback |
| sharing | 原生分享可用，或复制链接 fallback 已被产品接受 |
| Events ticket | 票券展示和核销准备链路 |
| Discover report | 举报提交与 Admin governance 后续证据 |
| Admin governance | Hosted Admin 使用生产 Admin auth 查看/处理被举报内容 |

## 失败归类

- Code-owned：代码或配置需要 Codex/开发修复。
- Account-owner-owned：微信账号、域名、认证、隐私或 CloudBase 控制台需要账号负责人处理。
- Device/platform limitation：设备或微信平台限制。
- Accepted product fallback：产品已接受 fallback，并在发布材料中说明。

未归类失败时，公开发布保持 blocked。
