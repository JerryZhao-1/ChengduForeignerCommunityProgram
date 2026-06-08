# 12-Week Delivery Plan: `places` Frontend + Global Backend in Parallel

## Summary

This plan uses a "backend half-step ahead, frontend/backend layered in parallel" strategy instead of "finish backend first, then start frontend."

Why this is the right approach:

- The current `places` frontend is still placeholder-level. If frontend work starts only after backend completion, there is not enough time in 12 weeks to finish list, map, detail, filtering, recommendation, favorite/share-ready interactions, and navigation.
- Fully parallel but unstructured work would cause repeated churn across `packages/shared`, BFF routes, and mobile pages.
- The workable sequence is:
  - Weeks 1-2: freeze shared contracts and backend foundations first, while frontend defines information architecture and page skeletons
  - Weeks 3-8: `places` frontend becomes the main product track, while backend stays 0.5-1 week ahead
  - Weeks 9-10: finish non-`places` backend and minimum admin management support
  - Weeks 11-12: integration, regression, and acceptance

End goal:

- complete `places` frontend and global backend within 12 weeks
- make `places` independently demoable instead of placeholder-only
- give `events` / `discover` frontend owners a stable backend for integration
- provide minimum usable admin support for content maintenance

## Delivery Strategy

- Work in three linked streams with a strict dependency order:
  - `packages/shared`: the only source of truth for fields, schemas, and contracts
  - `apps/api`: backend and CloudBase/BFF implementation, always slightly ahead of frontend
  - `apps/mobile/src/pages/places`: frontend implementation, built only against frozen interfaces
- Add a fourth deployment/bootstrap stream from Week 4 onward:
  - WeChat Mini Program registration and real AppID configuration
  - CloudBase `dev` / `prod` environment registration
  - document database collection registration, security rules, and index planning
  - cloud storage path and permission registration
  - HTTP cloud function/BFF deployment entry
  - admin static hosting and API domain configuration
- `apps/admin` follows backend capability in batches instead of running as an independent stream:
  - places management first
  - then events / posts / announcements management closure
- Do not allow either of these workflows:
  - build pages first and patch APIs later
  - build APIs first and decide page needs later
- Required implementation order for every user-facing capability:
  1. shared contract
  2. backend route/provider
  3. mobile/admin consumer
  4. tests and manual verification

## 12-Week Plan

### Week 1: Freeze scope and redefine `places` frontend as a 0-to-1 build

- Treat `places` frontend as effectively unbuilt; existing `index/detail/map` files count as placeholders, not completed product work.
- Define the full `places` frontend scope:
  - list
  - map
  - detail
  - filtering
  - recommendation entry
  - navigation
  - favorite/share-ready interactions in v1
- Audit shared contracts and split `places` into three response surfaces:
  - list card payload
  - map marker payload
  - detail payload
- Audit backend gaps across:
  - auth
  - events
  - discover
  - places
  - files
  - notifications
  - admin actions
- Define `places` page structure and navigation graph without doing final UI work yet.

### Week 2: Freeze `places` v1 contracts, build backend query baseline, start frontend skeletons

- Freeze `places` v1 shared interfaces:
  - list: pagination, keyword, category, tag, recommendation, sorting
  - detail: gallery, tags, business hours, address, intro, navigation-ready fields
  - markers: lightweight and separate from detail payload
- Make `places` list/detail/map-marker routes genuinely usable in backend.
- Build frontend page skeletons for:
  - list
  - map
  - detail
- Add shared state handling for:
  - loading
  - empty
  - error
  - locale-aware rendering

### Week 3: `places` list page v1 + stronger list/query backend

- Build `places` list page v1 with:
  - place cards
  - keyword search
  - category entry
  - recommendation entry
- Finish backend list filtering, sorting, pagination, and published-visibility behavior.
- Convert the homepage places entry from reserved teaser content into a real navigation entry.

### Week 4: `places` map page v1 + stable marker behavior

- Build `places` map page v1 with:
  - marker loading
  - marker selection
  - selected place summary card
  - map-to-detail navigation
- Keep marker payloads minimal and stable.
- Ensure backend only returns published/displayable places for markers.
- Start admin support for place coordinates, POI references, categories, and recommendation fields.
- Complete deployment catch-up work that should have been explicit in Weeks 1-3:
  - confirm the WeChat Mini Program account, real AppID, developer roles, and tester roles
  - create or confirm CloudBase `dev`, record env ID, region, HTTP function name, and admin hosting domain; keep `prod` pending until Week 11 environment separation work
  - register v1 collections: `users`, `places`, `file_assets`, `configs`, and `operation_logs`
  - list upcoming collections for later weeks: `events`, `posts`, `comments`, `announcements`, and `notifications`
  - register minimum `places` indexes for Week 4 list/map reads: `community_id + status`, `category_level_1`, `category_level_2`, `is_recommended`, and `recommended_rank`
  - freeze cloud storage paths: `public/places/{place_id}/`, `public/events/{event_id}/`, `public/posts/{post_id}/`, `private/tickets/{registration_id}/`, and `private/exports/{job_id}/`
  - document that the production Mini Program should prefer `wx.cloud.callHTTPFunction` for the HTTP cloud function, while Web admin uses the CloudBase HTTP access HTTPS domain
- Verify Week 4 against the real deployment baseline:
  - Mini Program AppID, CloudBase `dev` env ID, HTTP function name, and admin hosting domain are recorded in this plan or a linked deployment registry; `prod` remains a Week 11 item
  - CloudBase `dev` has the v1 required collections created with names aligned to shared/entity naming
  - `places` public list/map/detail field boundaries match between mock and CloudBase handler contracts
  - the map page is manually verified in WeChat Developer Tools or on a test device for marker loading, marker selection, detail jump, and detail navigation

### Week 5: `places` detail page v1 + media-backed detail data

- Build `places` detail page v1 with:
  - gallery
  - business hours
  - address
  - bilingual intro
  - tags
  - navigation button
- Expand backend detail payload so frontend no longer depends on placeholder data.
- Start attaching place gallery support through the files flow so detail pages can render real media.
- Ensure detail media rendering uses the registered cloud storage/file flow rather than hard-coded or manually entered gallery URL text.
- Verify that `places` detail renders real image URLs as images and no longer displays gallery URLs as plain text.
- Align the existing Mini Program UI to the TDesign MiniProgram guidelines; Week 5 must at least cover `places` detail plus any touched lists, dialogs, buttons, feedback, loading, and empty states.

### Week 6: `places` filtering/recommendation pages + admin places v1

- Build category/filter and recommended-places entry flows under `apps/mobile/src/pages/places`.
- Add backend support for:
  - recommendation fields
  - category/tag filtering
  - recommendation list queries
- Complete places admin v1:
  - create place
  - edit place
  - maintain bilingual intro
  - maintain category/tag/recommendation state
- Connect admin place gallery upload/attachment to `file_assets` so gallery ownership is tracked by the backend file flow.
- Verify that after admin uploads or registers place gallery media, `GET /places/:id` returns displayable media for the mobile detail page.

### Week 7: `places` favorite/share/navigation closure + visual unification

- Add frontend support for:
  - favorite button and visible state
  - page sharing entry points
  - unified navigation action handling
- If a persistent favorite backend would delay the core release, keep favorite as a v1 frontend seam with a clean upgrade path.
- Remove placeholder-quality copy and interaction patterns across the entire `places` module.
- Unify module-level visual and interaction standards so `places` feels like a complete product surface.
- Check Mini Program share behavior, privacy authorization requirements, and map location/navigation authorization prompts.

### Week 8: `places` integration week + places backend/admin closure

- Connect list, map, detail, filtering, recommendation, navigation, and favorite/share-ready behaviors into one complete flow.
- Handle real-data edge cases:
  - no gallery
  - no tags
  - no recommendation state
  - no markers
  - missing address
- Close remaining backend/admin issues that still block `places` frontend quality.
- Run the complete `places` flow in CloudBase `dev`, not only in mock mode:
  - list
  - map markers
  - detail
  - admin create/update
  - gallery media read
- Deploy `community-map-api` as the formal HTTP function for dev and create the CloudBase HTTP access `/api` route only after the function is no longer an Event placeholder.
- By the end of this week, `places` frontend main features must be complete.

### Week 9: Global backend completion pass 1

- Shift primary attention from `places` UI to the broader backend foundation.
- Bring `events` and `discover` backend behavior up to stable integration quality:
  - events lifecycle
  - discover create/comment/report/moderation
- Expand admin support for:
  - events management
  - posts moderation
  - minimum announcements management
- Register and begin CloudBase provider integration for `events`, `posts`, `comments`, `announcements`, and `notifications` collections.
- `places` frontend only receives compatibility fixes; no new feature scope.

### Week 10: Global backend completion pass 2

- Finish auth, role handling, files, notifications, and CloudBase/Koa parity work.
- Finish dev CloudBase provider integration for events, discover, files, and notifications, including permission negative paths.
- Add minimum useful backend support for admin files/logs surfaces.
- Ensure `events` and `discover` frontend work is no longer backend-blocked.
- By the end of this week, backend must be able to support three-module integration.

### Week 11: Full-chain integration and negative-path hardening

- Integrate:
  - `places` frontend + places backend + places admin
  - `events` / `discover` frontend + unified backend
  - mock provider and CloudBase handler behavior
  - CloudBase `dev` / `prod` environment separation, database security rules, HTTP cloud function logs, and admin static hosting
- Create or confirm the CloudBase `prod` environment during this environment separation pass, keeping region aligned with dev and avoiding production data writes until release readiness.
- Add or finish coverage for:
  - invalid input
  - insufficient permission
  - not found
  - unpublished places not visible
  - file/media read failure
  - map/navigation failure fallback
- No new features this week; only defect burn-down and stability work.

### Week 12: Acceptance, regression, and handoff

- Run full manual acceptance for:
  - places list / map / detail / filtering / recommendation / navigation
  - places admin management
  - events / discover backend integration
  - file upload and media display
  - login and permission behavior
  - Mini Program trial version, review submission readiness, admin production domain access, and production release checklist
- Run final checks:
  - `typecheck`
  - `test`
  - `lint`
  - OpenSpec strict validation
- Fix only high-priority issues.
- Produce handoff notes with:
  - stable APIs
  - field expectations
  - known limitations
  - integration notes

## Public APIs / Interfaces / Types

- `packages/shared` must freeze and own these interface groups:
  - `PlaceListQuery`: pagination, keyword, category, tag, recommendation, sorting
  - `PlaceMapMarker`: lightweight map response
  - `PlaceDetail`: gallery, business hours, address, tags, intro, navigation-ready fields
  - optional `favorite place` contract if persistence is included later; otherwise keep favorite as a deliberate v1 frontend seam
- `apps/api` must provide stable interfaces for three consumer groups:
  - `places` frontend
  - `events` / `discover` frontends
  - admin console
- `apps/admin` must be able to call at least:
  - create/edit place
  - gallery upload/attachment
  - category / tag / recommendation maintenance
  - minimum management actions for the other modules
- Deployment-facing interfaces must be explicitly registered before production release:
  - Mini Program AppID and CloudBase env IDs
  - HTTP cloud function name and access domain
  - admin static hosting domain
  - database collection names, minimum indexes, and security-rule ownership
  - cloud storage path prefixes and public/private visibility expectations

## Known Conflicts / Required Plan Adjustments

- `apps/api/src/providers/cloudbase/index.ts` currently reuses the mock provider. CloudBase handler/mock parity exists, but a real CloudBase database provider remains pending.
- `apps/mobile/src/manifest.json` now contains the real root AppID and `mp-weixin.appid`; Week 4 follow-up is limited to WeChat DevTools retest and manual map acceptance.
- The mobile API client currently supports mock or `uni.request`/fetch-style HTTP calls. Production Mini Program deployment must add a CloudBase HTTP function call mode so release builds do not depend on local HTTP or mock actor headers.
- The Week 5 admin places gallery flow has moved away from manually entered URLs and now attaches gallery files through the files flow; full live CloudBase file-asset resolution remains a backend foundation follow-up.
- The original plan placed CloudBase/Koa parity in Week 10. The minimum deployment baseline now starts in Week 4 so Week 8 can verify `places` against CloudBase `dev`.

## Test Plan

- Prioritize automated coverage for:
  - `packages/shared` schema/contract tests
  - `apps/api` route success / validation / permission / not-found behavior
  - mock vs HTTP/CloudBase parity
- Manual acceptance milestones:
  - Week 4: Mini Program AppID, CloudBase env IDs, HTTP function name, admin hosting domain, v1 collections, and required indexes are recorded; map behavior is manually verified in WeChat Developer Tools or on device
  - Week 5: list + map + detail basically usable
  - Week 8: complete `places` frontend chain usable
  - Week 12: full-project regression
- Required scenarios:
  - open places list and browse real place cards
  - open map page and inspect/select markers
  - open detail page and see gallery, business hours, address, tags, and bilingual content
  - launch navigation from detail
  - category/recommendation entry points return consistent results
  - admin place edits appear in mobile/API reads
  - unpublished places never appear in public surfaces
  - places detail renders real media from the registered file/storage flow
  - CloudBase `dev` can run places list/map/detail/admin update without relying on mock-only data
  - events/discover/files/notifications have dev CloudBase provider coverage and permission negative-path tests by Weeks 9-12
  - admin static hosting can access the configured API domain and refresh without route failure
  - Mini Program trial version passes login, places, events, discover, files, permissions, share, and navigation acceptance before submission

## Assumptions

- Current `places` frontend is treated as not yet developed; existing page files are placeholders only.
- Both frontend and backend must finish within the same 12-week window, so a fully serial backend-first approach is not acceptable.
- The recommended approach is backend half-step ahead with frontend progressing continuously from Week 2 onward.
- `packages/shared` remains the only entry point for shared payload and contract changes.
- `places` frontend main feature work must finish by the end of Week 8, or Weeks 11-12 will not be enough for integration and acceptance.
- This plan updates planning only; it does not mean CloudBase provider, Mini Program API mode, manifest AppID, database scripts, or deployment scripts have already been implemented.
- Week 4 is the current baseline. Deployment tasks that should have been explicit in Weeks 1-3 are added as Week 4 catch-up rather than backfilled as completed work.

---

# 12 周完整开发计划：`places` 前端 + 全局后端同步完成

## Summary

推荐采用“后端先行半步、前后端分层并行”的推进方式，而不是“先全做后端再做前端”。

原因：

- 当前 `places` 前端仍然是占位级状态。如果等后端全部做完再开前端，12 周内很难完成列表、地图、详情、筛选、推荐、收藏/分享准备、导航这些完整能力。
- 如果前后端完全同步但没有顺序约束，`packages/shared`、BFF 路由和移动端页面会不断返工。
- 最合适的节奏是：
  - 第 1-2 周：先冻结 shared contract 和后端基础，同时前端确定信息架构和页面骨架
  - 第 3-8 周：`places` 前端成为主产品主线，后端始终领先 0.5-1 周
  - 第 9-10 周：补齐非 `places` 的全局后端与最小后台管理能力
  - 第 11-12 周：联调、回归、验收

最终目标：

- 12 周内同时完成 `places` 前端和全局后端
- `places` 模块可以独立演示，不再只是占位页
- `events` / `discover` 前端同学可以基于稳定后端联调
- 后台具备最低可用的内容维护能力

## 推进策略

- 整体采用三条关联主线，但有严格先后顺序：
  - `packages/shared`：所有字段、schema、contract 的唯一事实来源
  - `apps/api`：后端与 CloudBase/BFF 实现，始终比前端早半步
  - `apps/mobile/src/pages/places`：前端实现，只基于已冻结接口推进
- 从第 4 周开始增加第四条“部署 / CloudBase Bootstrap”主线：
  - 微信小程序注册与真实 AppID 配置
  - CloudBase `dev` / `prod` 环境注册
  - 文档型数据库集合注册、权限规则和索引计划
  - 云存储路径与权限注册
  - HTTP 云函数 / BFF 部署入口
  - admin 静态托管与 API 域名配置
- `apps/admin` 不作为独立大主线，而是跟随后端能力分批补齐：
  - 先做 places 管理
  - 再收口 events / posts / announcements 管理闭环
- 禁止以下两种工作方式：
  - 页面先写完，再补接口
  - 接口先写完，再考虑页面需求
- 每个用户能力都必须按以下顺序推进：
  1. shared contract
  2. backend route/provider
  3. mobile/admin consumer
  4. tests 和人工验证

## 12 周周计划

### 第 1 周：冻结范围，将 `places` 前端重新定义为从 0 到 1 建设

- 明确将 `places` 前端视为“未开发完成”；现有 `index/detail/map` 文件只算占位，不算完成工作。
- 定义完整的 `places` 前端能力范围：
  - 列表
  - 地图
  - 详情
  - 筛选
  - 推荐入口
  - 导航
  - 收藏/分享准备能力（v1）
- 审计 shared contract，将 `places` 拆成三类响应面：
  - 列表卡片数据
  - 地图 marker 数据
  - 详情页数据
- 审计后端缺口：
  - auth
  - events
  - discover
  - places
  - files
  - notifications
  - admin actions
- 先确定 `places` 页面结构和跳转关系，不急着做最终 UI。

### 第 2 周：冻结 `places` v1 contract，建立后端查询基线，开始前端骨架

- 在 shared 中冻结 `places` v1 接口：
  - list：分页、关键词、分类、标签、推荐位、排序
  - detail：图集、标签、营业时间、地址、简介、导航相关字段
  - marker：轻量返回体，不复用详情结构
- 把 `places` 的 list/detail/map-markers 后端接口补到真正可用。
- 开始搭建前端三页骨架：
  - list
  - map
  - detail
- 建立统一状态处理：
  - loading
  - empty
  - error
  - locale 切换显示

### 第 3 周：`places` 列表页 v1 + 列表后端能力增强

- 完成 `places` 列表页 v1：
  - 地点卡片
  - 关键词搜索
  - 分类入口
  - 推荐入口
- 后端补齐列表筛选、排序、分页和 published 可见性规则。
- 将首页中的 places 入口从预留展示改成真实跳转入口。

### 第 4 周：`places` 地图页 v1 + marker 行为稳定

- 完成 `places` 地图页 v1：
  - marker 加载
  - marker 选中
  - 选中地点摘要卡片
  - 地图跳详情
- 保持 marker 返回体最小且稳定。
- 确保后端 marker 接口只返回可公开展示的地点。
- 开始补后台中的坐标、POI、分类和推荐位字段支持。
- 补齐第 1-3 周没有显式写入计划的部署前置工作：
  - 确认微信小程序账号、真实 AppID、开发者权限和体验者权限
  - 创建或确认 CloudBase `dev` 环境，并记录 env id、区域、HTTP 云函数名和 admin 托管域名；`prod` 保持 pending，移到第 11 周环境隔离工作中处理
  - 注册 v1 必需集合：`users`、`places`、`file_assets`、`configs`、`operation_logs`
  - 列出后续周需要接入的集合：`events`、`posts`、`comments`、`announcements`、`notifications`
  - 为第 4 周 places list/map 查询登记最低索引：`community_id + status`、`category_level_1`、`category_level_2`、`is_recommended`、`recommended_rank`
  - 固定云存储路径：`public/places/{place_id}/`、`public/events/{event_id}/`、`public/posts/{post_id}/`、`private/tickets/{registration_id}/`、`private/exports/{job_id}/`
  - 明确生产小程序优先使用 `wx.cloud.callHTTPFunction` 调用 HTTP 云函数，Web admin 使用 CloudBase HTTP 访问服务 HTTPS 域名
- 第 4 周验收必须覆盖真实部署基线：
  - 小程序 AppID、CloudBase `dev` env id、HTTP 云函数名、admin 托管域名已记录在本计划或关联部署登记文档中；`prod` 作为第 11 周事项保留
  - CloudBase `dev` 环境已创建 v1 必需集合，集合命名与 shared/entity 命名一致
  - `places` public list/map/detail 在 mock 与 CloudBase handler contract 下字段边界一致
  - 地图页已在微信开发者工具或测试真机中完成人工验证：marker 加载、marker 选中、跳详情、详情导航

### 第 5 周：`places` 详情页 v1 + 媒体化详情数据

- 完成 `places` 详情页 v1：
  - 图集
  - 营业时间
  - 地址
  - 双语简介
  - 标签
  - 导航按钮
- 扩展后端详情 payload，让前端不再依赖占位数据。
- 通过 files 流开始支持地点图集，让详情页可以渲染真实媒体。
- 确保详情页媒体渲染使用已注册的云存储 / files flow，不再依赖硬编码或后台手填的 gallery URL 文本。
- Week 5 详情 payload 以 `gallery_media` 作为主字段，`gallery_urls` 仅作为由媒体 URL 派生的兼容字段；完整 CloudBase live files provider 留到后续 backend foundation 工作。
- 验证 `places` 详情页能将真实图片 URL 渲染为图片，不再把 gallery URL 当普通文本显示。
- 将现有小程序 UI 统一到 TDesign MiniProgram 规范；Week 5 至少覆盖 `places` 详情页以及当周触达的列表、弹窗、按钮、反馈、加载和空状态。

### 第 6 周：`places` 筛选/推荐页 + 后台 places 管理 v1

- 在 `apps/mobile/src/pages/places` 下完成分类筛选和推荐地点入口流。
- 后端补齐：
  - 推荐字段
  - 分类/标签筛选
  - 推荐地点查询
- 完成后台 places 管理 v1：
  - 新增地点
  - 编辑地点
  - 维护双语简介
  - 维护分类/标签/推荐状态
- 将后台 places 图集上传/挂接接入 `file_assets`，由后端文件流追踪图集归属。
- 验证后台上传或登记地点图集后，`GET /places/:id` 能返回移动端详情页可展示的媒体。

### 第 7 周：`places` 收藏/分享/导航收口 + 模块视觉统一

- 完成前端以下能力：
  - 收藏按钮与可见状态
  - 页面分享入口
  - 统一导航动作封装
- 如果持久化 favorite 后端会拖慢主线，就将 favorite 保持为 v1 前端能力预留，并确保未来可无痛升级。
- 去掉 `places` 模块中的占位文案和占位交互。
- 统一模块级视觉和交互标准，让 `places` 看起来像完整产品，而不是样板页。
- 检查小程序分享行为、隐私授权要求，以及地图定位/导航授权提示。

### 第 8 周：`places` 整合周 + places backend/admin 收尾

- 将列表、地图、详情、筛选、推荐、导航、收藏/分享准备能力串成完整链路。
- 处理真实数据边界：
  - 无图集
  - 无标签
  - 无推荐位
  - 无 marker
  - 地址缺失
- 收尾所有仍阻塞 `places` 前端质量的 backend/admin 问题。
- 在 CloudBase `dev` 环境跑通完整 places 链路，而不只是在 mock 模式下验证：
  - list
  - map markers
  - detail
  - admin create/update
  - gallery media read
- 将 `community-map-api` 部署为 dev 正式 HTTP 函数，并且只在它不再是 Event 占位函数后创建 CloudBase HTTP 访问服务 `/api` 路由。
- 到本周结束，`places` 前端主功能必须全部完成。

### 第 9 周：全局后端补齐第 1 轮

- 将主要注意力从 `places` UI 转向更广的后端基础。
- 把 `events` 和 `discover` 后端能力补到稳定联调水平：
  - events 生命周期
  - discover 发帖 / 评论 / 举报 / 治理
- 扩展后台支持：
  - events 管理
  - posts 治理
  - announcements 最低可用管理
- 注册并开始接入 `events`、`posts`、`comments`、`announcements`、`notifications` 的 CloudBase provider 集合。
- `places` 前端只做兼容性修复，不再扩功能。

### 第 10 周：全局后端补齐第 2 轮

- 集中补 auth、role、files、notifications，以及 CloudBase/Koa 行为一致性。
- 完成 events、discover、files、notifications 的 dev CloudBase provider 接入，并覆盖权限负路径。
- 为后台 files/logs 页面补最低有用的后端支撑。
- 确保 `events` 和 `discover` 前端不再被后端阻塞。
- 到本周结束，后端必须能支撑三模块联调。

### 第 11 周：全链路联调与负路径加固

- 联调范围：
  - `places` 前端 + places backend + places admin
  - `events` / `discover` 前端 + 统一 backend
  - mock provider 与 CloudBase handler 行为一致性
  - CloudBase `dev` / `prod` 环境隔离、数据库安全规则、HTTP 云函数日志和 admin 静态托管
- 在本轮环境隔离工作中创建或确认 CloudBase `prod` 环境，区域与 dev 保持一致；发布准备完成前不写入生产业务数据。
- 补齐或完成以下负路径覆盖：
  - 参数非法
  - 权限不足
  - 资源不存在
  - 未发布地点不可见
  - 文件/媒体读取失败
  - 地图/导航失败回退
- 本周不扩新功能，只做缺陷收敛和稳定化。

### 第 12 周：验收、回归、交接

- 做完整人工验收：
  - places 列表 / 地图 / 详情 / 筛选 / 推荐 / 导航
  - places 后台管理
  - events / discover 后端联调
  - 文件上传与媒体展示
  - 登录和权限行为
  - 小程序体验版、提交审核准备、admin 生产域名访问和发布前检查
- 跑最终检查：
  - `typecheck`
  - `test`
  - `lint`
  - OpenSpec strict validation
- 只修高优问题。
- 输出交接说明，包括：
  - 稳定 API
  - 字段预期
  - 已知限制
  - 联调注意事项

## Public APIs / Interfaces / Types

- `packages/shared` 必须冻结并拥有以下接口组：
  - `PlaceListQuery`：分页、关键词、分类、标签、推荐位、排序
  - `PlaceMapMarker`：轻量地图返回体
  - `PlaceDetail`：图集、营业时间、地址、标签、简介、导航相关字段
  - 如果未来加入持久化 favorite，再补 `favorite place` contract；如果当前不做，就明确它是刻意保留的 v1 前端接口边界
- `apps/api` 需要为三类 consumer 提供稳定接口：
  - `places` 前端
  - `events` / `discover` 前端
  - admin 后台
- `apps/admin` 至少要能调用：
  - 新增/编辑地点
  - 图集上传/挂接
  - 分类 / 标签 / 推荐位维护
  - 其他模块的最低管理动作
- 面向部署的接口与配置必须在正式发布前显式登记：
  - 小程序 AppID 与 CloudBase env id
  - HTTP 云函数名与访问域名
  - admin 静态托管域名
  - 数据库集合名、最低索引和安全规则归属
  - 云存储路径前缀和公私权限预期

## 已知冲突 / 必须调整的计划点

- `apps/api/src/providers/cloudbase/index.ts` 当前仍复用 mock provider。CloudBase handler/mock parity 已有，但真实 CloudBase 数据库 provider 仍待接入。
- `apps/mobile/src/manifest.json` 已包含真实根 AppID 和 `mp-weixin.appid`；第 4 周后续只需要微信开发者工具复测和地图人工验收。
- 当前移动端 API client 支持 mock 或 `uni.request`/fetch 风格 HTTP 调用。生产小程序部署必须新增 CloudBase HTTP function 调用模式，避免发布版本依赖本地 HTTP 或 mock actor header。
- 第 5 周后台 places 图集已改为通过 files flow 挂接文件，不再依赖手填 URL；完整 CloudBase live 文件资产解析仍是 backend foundation 后续项。
- 原计划把 CloudBase/Koa parity 放在第 10 周。现在最低部署基线必须从第 4 周开始建立，否则第 8 周无法用 CloudBase `dev` 验证 places。

## Test Plan

- 自动化测试重点：
  - `packages/shared` schema/contract 测试
  - `apps/api` route success / validation / permission / not-found 行为
  - mock 与 HTTP/CloudBase 行为一致性
- 人工验收里程碑：
  - 第 4 周：小程序 AppID、CloudBase env id、HTTP 云函数名、admin 托管域名、v1 集合和必要索引已记录；地图行为已在微信开发者工具或真机中验证
  - 第 5 周：列表 + 地图 + 详情基本可用
  - 第 8 周：`places` 前端完整链路可用
  - 第 12 周：全项目回归
- 必须覆盖的关键场景：
  - 进入 places 列表可浏览真实地点卡片
  - 进入地图页可看到并选中 marker
  - 进入详情页可看到图集、营业时间、地址、标签和双语内容
  - 从详情页发起导航
  - 分类/推荐入口返回一致结果
  - 后台编辑地点后前台/API 可读到最新数据
  - 未发布地点不会出现在前台
  - places 详情页能从已登记的 files/storage 流渲染真实媒体
  - CloudBase `dev` 能在不依赖 mock-only 数据的情况下跑通 places list/map/detail/admin update
  - 第 9-12 周 events/discover/files/notifications 具备 dev CloudBase provider 覆盖和权限负路径测试
  - admin 静态托管可访问已配置 API 域名，刷新页面不出现路由失败
  - 小程序体验版在提交审核前通过登录、places、events、discover、文件、权限、分享、导航验收

## Assumptions

- 当前 `places` 前端按“未开发完成”处理，现有页面文件只算占位。
- 前后端都必须在同一个 12 周周期内完成，因此不能采用完全串行的“先后端后前端”策略。
- 推荐策略是“后端先行半步，前端从第 2 周起持续推进”。
- `packages/shared` 仍然是所有共享 payload 和 contract 变更的唯一入口。
- `places` 前端主功能必须在第 8 周结束前完成，否则第 11-12 周将不足以完成全链路联调和验收。
- 本计划只更新计划内容；这不代表 CloudBase provider、小程序 API mode、manifest AppID、数据库脚本或部署脚本已经实现。
- 第 4 周是当前基准周。部署相关且本应在第 1-3 周明确的前置工作，统一作为第 4 周补课项加入，而不是回填成已完成。
