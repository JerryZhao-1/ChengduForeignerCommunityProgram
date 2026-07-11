# Mobile 中英双语运营与发布 Runbook

本文档定义 Mobile H5 / 微信小程序的语言状态、正式内容归属、后台修复、内容审计、发布与回滚流程。它与 [UI 规范](./ui-guidelines.md)、[API 手册](./API接口使用手册.md)、[小程序公开发布人工操作手册](./mini-program-public-launch-manual.md) 和 [真机验收手册](./public-launch-true-device-runbook.md) 共同构成发布依据。

## 1. Locale precedence、持久化与同步

启动时按以下优先级决定界面语言：

1. 本机持久化的显式选择 `zh` / `en`；
2. 已登录账号的 `preferred_language`；
3. 设备语言（英文设备选择 `en`，中文设备选择 `zh`）；
4. 无法判断时使用 `zh`。

用户在 Language 页面显式选择后，界面标题、五个 Tab 和页面文案立即更新并写入本地存储。登录状态下再异步同步 `preferred_language`；同步失败不能回滚本机选择。无效存储值必须忽略。登录/session 初始化不得强制写回中文。

语言开关控制系统 UI 与正式双语字段的选择，不翻译用户原创内容，也不等同于“把所有数据库文本自动翻译”。

## 2. Formal content fallback 与 UGC boundary

Events、Places、Announcements 等正式内容使用 `_zh` / `_en` 字段。读取时先 trim，再选当前语言；当前语言缺失时可显示另一语言并提供 fallback indicator，两个语言都缺失时显示本地化的 Unavailable/暂无信息。任何会触发发布关键正式内容 fallback 的缺口，内容审计都视为 blocker，不能以运行时 fallback 代替编辑补齐。

Discover 帖子、评论等 UGC 保留作者原文，通过 `language=zh|en` 声明 original language；界面只本地化语言徽标、按钮、状态和错误，不要求或伪造另一语言副本。

## 3. API compatibility 与字段归属

Event 新写入的标准地址字段为 `address_zh` / `address_en`。`address_text` 仅用于 legacy read compatibility；旧记录读取时可归一到中文地址，但不得从中文自动生成英文地址。新建草稿可不完整，公开前必须补齐：

- Event：`title_zh/title_en`、`summary_zh/summary_en`、`content_zh/content_en`、`address_zh/address_en`。
- Place：`name_zh/name_en`、`address_zh/address_en`、`business_hours_zh/business_hours_en`、`intro_zh/intro_en`；推荐地点还需 `recommended_reason_zh/recommended_reason_en`。
- Announcement：`title_zh/title_en`、`summary_zh/summary_en`、`content_zh/content_en`。

Notification 新系统通知写 `title_zh/title_en` 与 `body_zh/body_en`。`title/body` 是 legacy compatibility fields；读取时优先当前语言双语字段，缺失时安全回退到另一语言或 legacy 字段。所有通知仍按当前 actor 做 ownership 校验。

空白字符和已知 placeholder（例如 `TBD`、`TODO`、`placeholder`、`待补充`、`草稿`、`to be translated`）都不能满足发布就绪条件。

## 4. Admin repair flow

1. 在 Admin Events/Places 表格查看“双语发布就绪”和缺失字段。
2. 打开编辑弹窗，补齐中文和英文正式字段；英文必须由内容负责人审核，不能直接采用机器生成结果作为 editorial truth。
3. 未完成内容可 Save as Draft；不得 Publish、Review and Publish、Quick Publish，也不得通过局部编辑让已发布的不完整记录绕过门禁。
4. API 返回 `400 VALIDATION_ERROR` 时按 field path 修复；发布转换必须保持原子性。
5. 修复后重新导出候选数据并运行内容审计，不以 Admin 表格截图替代数据证据。

## 5. Export provenance 与内容审计

导出 JSON 必须包含：

- `evidenceKind`: `fixture` 或 `production-candidate`；
- `provenance.environment`、`provenance.exportedAt`；
- `provenance.source.collections` 和精确 `query`；
- `provenance.recordCounts`；
- `events`、`places`、`announcements`、`discoverPosts` 候选记录。

fixture 只用于回归，即使 0 issue 也必须是 `releaseEligible=false`。真实发布必须使用账号负责人确认的 production-candidate export，审计为 0 blocking 且 0 editorial 才能进入最终发布验收。

```bash
pnpm --filter @community-map/api exec tsx ../../scripts/bilingual-content-audit.ts \
  --input /secure/path/production-candidate.json \
  --output /secure/path/production-candidate-audit.json
```

审计检查双语字段、空白、placeholder、fallback 缺口、状态泄漏、开发/fixture URL、媒体 attribution，以及 Discover 原始语言元数据。输出将 blocking 与 editorial 分开。导出可能包含用户内容，不得提交生产原始导出或个人数据到 Git。

## 6. Dry-run-first backfill

迁移工具只复制已知语言的 legacy 值：Event `address_text -> address_zh`；Notification 只有在 `migrationHints.notificationLegacyLocales` 明确记录语言后，才复制到相应 `_zh` / `_en` 字段。它绝不生成另一语言翻译。

```bash
pnpm --filter @community-map/api exec tsx ../../scripts/bilingual-content-migration.ts \
  --input /secure/path/export.json --scope events --report /secure/path/plan.json
```

人工审核 plan 后，只有提供同一 input/scope 的 `planDigest` 才可生成迁移后的 JSON；工具不直接写 CloudBase：

```bash
pnpm --filter @community-map/api exec tsx ../../scripts/bilingual-content-migration.ts \
  --input /secure/path/export.json --scope events --apply \
  --approved-plan-digest '<reviewed-digest>' \
  --output /secure/path/migrated.json --report /secure/path/applied.json
```

再次 dry-run 必须为 0 action。带 editorial review 的记录仍需人工补齐，不能直接发布。

## 7. Build、验收与 release evidence

```bash
pnpm --filter @community-map/mobile build:h5
VITE_API_MODE=cloudbase-function \
VITE_CLOUDBASE_ENV_ID='<approved-env-id>' \
VITE_CLOUDBASE_FUNCTION_NAME='<approved-function-name>' \
pnpm --filter @community-map/mobile build:mp-weixin
```

H5 验收必须按 `apps/mobile/src/pages.json` 覆盖每个 route 的中英文，并检查显式选择、重启持久化、标题/Tab、加载/空/错误/校验状态、正式内容 fallback 与 UGC 原文。微信发布候选必须导入 `apps/mobile/dist/build/mp-weixin`，在 DevTools 和真实 iOS/Android 设备验证 Home、Events、Discover、Places、Me、原生地图/导航/分享、权限 fallback 和实际 API target。

最终 English release evidence 至少包括：构建日志与产物扫描、route screenshot index、设备/微信版本、network target、真实 production-candidate audit、测试记录 id、权限/原生能力结果、console/network errors 和 blocker owner。

## 8. Rollout 与 rollback order

Rollout 顺序：先部署 additive schema/read normalization，再执行 dry-run/backfill 和人工补齐，再启用严格发布门禁，最后构建/验收/上传客户端。不得先上传依赖新字段的客户端，再补后端和内容。

Rollback 顺序：暂停新发布动作；保留兼容读取字段；回退客户端到 previous known-good version；如需回退严格门禁，必须保持已写入的双语字段不丢失；记录版本、操作者、时间、原因和受影响 record ids。不要删除 `address_text` 或 legacy Notification 字段，直到兼容窗口正式结束。

## 9. Security and assumptions

文档与证据不得包含 API 密钥、token、明文账号密码、生产用户原始数据或小程序上传私钥。环境 ID 和函数名只能来自获批部署配置。本项目仍是桐梓林单社区；CloudBase 是目标生产方向，本地默认 mock。
