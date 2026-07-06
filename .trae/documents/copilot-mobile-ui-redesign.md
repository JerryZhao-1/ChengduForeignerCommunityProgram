# Plan: 桐梓林外籍居民生活导航 Copilot — 移动端 UI 重设计

## Summary

将当前以功能模块为中心的移动端 UI（Home / Events / Discover / Places 四 Tab），重设计为以**场景驱动**为中心的 "Life Copilot" 体验。核心转变是从"列表找信息"变为"我今天要解决什么问题"，围绕 5 个场景入口、Life Guide 详情页、Show this in Chinese 双语行动卡、志愿者任务页四大新模块展开。

本计划产出为 **.design 画布项目**（HTML mockup），不修改现有 uni-app 源码。

## Current State Analysis

**现有 App 结构** (`apps/mobile/src/`):

- **TabBar**: Home / Events / Discover / Places（地图视图）
- **Home** (`pages/home/index.vue`): 线性排列 Events、Announcements、Places 的 SectionPanel 列表，含快捷入口网格
- **Events** (`pages/events/index.vue`): 按 Tab（全部/本周/即将/我的）过滤的活动卡片列表
- **Discover** (`pages/discover/index.vue`): 简单帖子流 + 发帖按钮
- **Places** (`pages/places/map.vue`): 地图视图 + 底部摘要卡；另有 `index.vue`（列表）、`detail.vue`（详情）
- **More**: 登录、通知、我的报名、我的收藏、我的帖子、语言设置
- **风格**: teal 主色（`#0f766e`/`#0052d9` 混用）、`#f8fafc` 背景、卡片式布局、基础 snake_case 双语字段
- **组件库**: 原生 uni-app 组件 + 2 个自定义组件（SectionPanel、AsyncStateCard），项目规范要求微信小程序端优先 TDesign MiniProgram

**核心问题**:
1. TabBar 按功能模块划分，外籍用户需自己理解"我想找什么应该去哪个 Tab"
2. 信息组织无场景上下文，新居民无法快速获得"搬来第一天该去哪"的答案
3. 地点详情只有结构化字段展示，缺少可实际使用的中英双语行动指导
4. 缺少社区参与入口（志愿者共建）

## Proposed Changes — 6 个画布页面

### Device Type: `mobile`（微信小程序风格，375pt 宽度）

### Page 1: 新首页 — "What do you need today?"

**路径**: `pages/home-redesign.html`

**布局结构**:
- **顶部 Hero**: 品牌 Logo + 社区名称 "Tongzilin Community" + 搜索框
- **场景入口区**: 5 个大卡片（2 列 + 1 横向全宽），每个卡片含 emoji icon、中英双语标题、一句话副标题
  - 🏠 New in Tongzilin — "刚搬来？一键获取生活路线"
  - 👨‍👩‍👧 Family Weekend — "带孩子去哪玩"
  - 🆘 Need Help — "医疗、办事、应急"
  - 🤝 Meet People — "社区活动与社交"
  - 🍜 Food & Daily Life — "美食、超市、日常"
- **本周推荐活动**: 横向滚动卡片（最多 3 张），显示 cover、标题、时间
- **附近热门地点**: 横向滚动小卡片（最多 4 张），显示封面 + 名称 + 分类
- **底部 TabBar**: Home / Life Guide / Map / More（4 个 Tab，Events 和 Discover 合入场景流）

**双语策略**: 默认英文为主（外籍居民），中文作为辅助翻译。场景卡片标题中英并排。

### Page 2: Life Guide — 场景化生活导览

**路径**: `pages/life-guide.html`

**布局结构**:
- **顶部**: 返回导航 + 场景标题（如 "New in Tongzilin"）+ 场景描述
- **路线概览**: 3-5 个地点的竖向时间线/路线卡片，每个地点显示:
  - 序号标记（①②③）
  - 封面缩略图
  - 地点名称（中英）
  - 一句话推荐理由
  - "Show this in Chinese" 按钮
- **相关活动**: 嵌入 1 个活动推荐卡（可报名状态）
- **社区经验帖**: 1-2 条 Discover 帖子预览卡（带地点绑定标识）
- **地图路线预览**: 小地图区域，标注上述地点的位置连线
- **底部**: "分享路线" 按钮（生成可分享卡片）+ "保存到我的收藏"

**双语策略**: 路线卡片中文名称放小字在英文名称下方；每个地点卡有中英双语摘要。

### Page 3: 地点详情增强 — "Show this in Chinese"

**路径**: `pages/place-detail-enhanced.html`

**在现有地点详情基础上新增**:
- **"Show this in Chinese" 行动卡区**: 可展开/收起的面板，内含 3 张行动卡:
  - 🚕 给司机看（中文名称 + 地址大字展示）
  - 🏪 给店员看（"我想..." + 中文需求句）
  - 🏢 给物业/工作人员看（社区事务相关中文表达）
- 每张行动卡: 大字号中文（方便拿给对方看）+ 小字英文翻译 + 复制/截图提示
- **导航增强**: 在原有"发起导航"旁增加"分享给出租车司机"按钮
- **社区贡献入口**: 底部增加 "Suggest an edit" 浮动按钮

### Page 4: 志愿者任务页 — "Help Improve This Map"

**路径**: `pages/volunteer-tasks.html`

**布局结构**:
- **顶部**: 标题 "Help Improve This Map" + 贡献统计（如 "社区已有 12 位志愿者贡献了 28 条信息"）
- **任务类型 Tab**: 纠错 / 补照片 / 补英文名 / 补营业时间
- **任务列表**: 每条任务卡显示:
  - 地点名称 + 当前缺失/错误信息预览
  - 任务类型标签
  - "认领" 按钮 → 进入提交页面（画布内不做完整提交流程，只做入口展示）
- **排行榜/荣誉**: 简单的贡献者排行

### Page 5: 应急便民服务卡

**路径**: `pages/emergency-cards.html`

**布局结构**:
- **顶部**: 🆘 Emergency & Services 卡片
- **分类卡片网格**: 
  - 医院/诊所（含最近的三甲医院）
  - 派出所/警察局
  - 社区服务中心
  - 物业管理
  - 银行/ATM
  - 药店
- 每张卡片: 大字号中文名称 + 英文翻译 + 地址 + 联系电话 + "拨打" 按钮
- **底部提示**: "这些信息由社区志愿者维护，如有变更请提交更新"

### Page 6: 演示链路总览

**路径**: `pages/demo-flow.html`

**作为参赛 Demo 的完整用户旅程展示页**:
- 横向步骤条展示完整链路:
  1. 选择场景 "New in Tongzilin"
  2. 获得生活路线
  3. 打开地点详情
  4. 一键导航/分享
  5. 报名社区活动
  6. 活动后发布经验帖
  7. 志愿者补充地点信息
  8. 管理端审核发布
- 每个步骤可点击跳转到对应设计页面（画布 wiring）

## Assumptions & Decisions

1. **语言默认英文**: 目标用户是外籍居民，主语言为英文，中文作为辅助展示
2. **设备类型**: Mobile（微信小程序风格），375pt 画布宽度
3. **配色沿用项目现有 teal 主色**: 保持与现有 app 的品牌一致性（`#0f766e` 为主色，`#155e75` 为辅助），不引入全新配色方案
4. **不涉及后端/API 改动**: 本计划仅为 UI 设计 mockup，不修改任何 `apps/api`、`packages/shared` 代码
5. **TabBar 重新设计**: 从 4 Tab（Home/Events/Discover/Places）改为 4 Tab（Home/Life Guide/Map/More），Events 和 Discover 内容融入场景流
6. **输出格式**: .design 画布项目（HTML + Tailwind CDN），6 个页面，线性 wiring 链路

## Verification Steps

1. 运行 `scan-design-directory.mjs` 验证 `.design` 文件完整性
2. 检查所有 6 个页面的 HTML 文件存在且可渲染
3. 确认页面间 wiring 连接正确（Demo Flow 页可跳转到其他 5 个页面）
4. 在画布中预览确认移动端视觉效果正确
