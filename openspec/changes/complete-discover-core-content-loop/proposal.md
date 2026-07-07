## Why

Discover 已经具备帖子列表、详情、发帖、写评论、举报和基础隐藏能力，但评论不可读取、帖子媒体上传没有接入、我的帖子仍是占位、帖子缺少真实时间和计数字段。这个 change 先补齐用户能发布、阅读、评论、回看自己内容的核心内容闭环，为后续治理、跨模块联动和社交运营提供稳定数据基础。

## What Changes

- 扩展 discover 帖子契约，补齐 `created_at`、`updated_at`、公开可见 `comment_count`、`like_count`、`favorite_count`、`share_count`、`place_id`、`event_id` 和作者展示快照等基础字段。
- 增加评论读取接口，让帖子详情页展示真实评论历史，提交评论后可通过重新读取保持一致。
- 增加当前用户帖子查询接口，替换 `pages/more/my-posts` 占位页。
- 将发帖媒体从 URL 输入升级为小程序/ H5 选择图片或视频并通过 `public/posts/` 文件路径上传、完成、绑定到帖子。
- 改造移动端 discover 列表、详情、发帖和我的帖子页面，使其使用真实字段、真实评论和真实媒体资产。
- 在 mock provider 和 CloudBase live provider 中落地 discover posts/comments/file binding 的持久化边界，避免线上继续 fallback 到内存 mock。
- 更新 API 文档和 focused tests，确保公共可见性、评论读取、我的帖子、媒体上传和 CloudBase discover live 行为可验证。

## Capabilities

### New Capabilities
- `discover-core-content-loop`: Discover core content model, comment read path, my-posts query, post media upload/binding, and live persistence readiness.

### Modified Capabilities
- `discover-integration-readiness`: Existing discover baseline is extended from write-only comments and minimal post payloads to read/write comments, user-owned post lists, richer post metadata, and provider parity.
- `files-auth-notifications-readiness`: Existing file upload rules are extended to cover user-facing post media upload and binding through `public/posts/`.
- `cloudbase-dev-api-deployment`: Non-places live provider status is updated so discover can be marked live-accepted only after real CloudBase collections and evidence exist.

## Impact

- Shared schemas, types, contracts, paths, client, mock service, and tests.
- API discover routes/provider types/mock provider/CloudBase provider/file binding behavior.
- Mobile discover list/detail/create pages and `pages/more/my-posts`.
- API documentation, CloudBase deployment documentation, and focused shared/API/mobile validation.
