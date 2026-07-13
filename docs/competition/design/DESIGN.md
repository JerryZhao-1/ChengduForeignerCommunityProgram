# 设计总纲 — 桐邻 First 120 Minutes（精炼版）

## 1. 目的陈述 (Purpose Statement)

将桐梓林社区地图 H5 的零散功能（活动、地点、发现），组织成一条面向新到中外居民的"前 120 分钟融入路线"叙事，降低首次使用认知成本。

本设计采用 Direction A "成都社区探索手册"编辑风格为基底，吸收 Direction B "国际邻里通行证"的路线完成印章隐喻，形成既有编辑叙事性又有仪式感完成体验的完整设计。

核心目标：
- 评委/访客 10 秒内理解产品价值
- 用户 30 秒内生成个人路线
- 双语 CN/EN 全程视觉权重平等
- 路线完成时有明确的仪式感反馈

## 2. 美学方向 (Aesthetic Direction)

编辑手册风格（Editorial / Organic Community Field Guide）：

- 温暖奶油纸质底色（`#F6F0E5`），模拟社区指南手册的纸张质感
- Fraunces 可变衬线字体（opsz 9-144）+ Songti SC 宋体，营造编辑/杂志气质
- 虚线路由分割线 + 端点圆点，模拟手绘路线标注
- 真实社区摄影，无插画风/emoji 图标
- 路线完成印章：圆形虚线内环 + 衬线字体 + -8 度旋转，模拟手册封印
- 活动用赤陶色（`#E66A45`），文化提示用琥珀色（`#D39A3A`），严格限定用途

## 3. 色彩 Token (Color Tokens)

### 品牌色

| Token | 值 | 用途 |
|-------|------|------|
| `--brand-primary` | `#0F766E` | 主品牌色，CTA、选中态、强调 |
| `--brand-primary-dark` | `#123B3A` | 深品牌色，hover、标题 |
| `--brand-primary-tint` | `#B3DFDB` | 浅品牌色，标签底色 |
| `--brand-primary-tint-soft` | `#E8F4F2` | 极浅品牌色，卡片底色 |

### 背景色

| Token | 值 | 用途 |
|-------|------|------|
| `--surface-base` | `#F6F0E5` | 页面底色，奶油纸 |
| `--surface-paper` | `#FBF8F1` | 卡片底色，略浅于页面 |
| `--surface-raised` | `#FFFFFF` | 浮层底色，纯白 |

### 文字色

| Token | 值 | 用途 |
|-------|------|------|
| `--ink-primary` | `#263331` | 正文，深 teal-gray |
| `--ink-secondary` | `#5C6B68` | 次要文字 |
| `--ink-tertiary` | `#8FA09D` | 辅助文字、占位符 |

### 功能强调色（严格限定用途）

| Token | 值 | 用途 | 禁止用途 |
|-------|------|------|---------|
| `--accent-activity` | `#E66A45` | 活动标签、活动按钮 | 不用于非活动元素 |
| `--accent-activity-tint` | `#FCE8E0` | 活动标签底色 | — |
| `--accent-tip` | `#D39A3A` | 文化提示图标、提示文字 | 不用于非文化提示 |
| `--accent-tip-tint` | `#F7EDD8` | 文化提示背景 | — |

### 边框

| Token | 值 | 用途 |
|-------|------|------|
| `--border-default` | `#E5DDD0` | 卡片边框 |
| `--border-soft` | `#F0EBE0` | 分割线、浅边框 |

### 暗色模式

暗色模式覆盖见 `colors_and_type.css` `.dark` 块。核心映射：主色提亮为 `#2DD4BF`，背景转为深 teal `#0A1F1E`，文字反转为奶油色。

## 4. 字体 (Typography)

### 字体栈

| Token | 字体栈 | 用途 |
|-------|--------|------|
| `--font-display` | `"Fraunces", "Songti SC", "STSong", "SimSun", serif` | 标题、展示文字 |
| `--font-body` | `"PingFang SC", "Microsoft YaHei", sans-serif` | 正文（与 `apps/mobile/src/App.vue` 一致） |
| `--font-mono` | `"JetBrains Mono", "Courier New", monospace` | 时间、ID、标签代码 |

### 字号阶梯

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| H1 页面标题 | 26px | 600 | 1.2 |
| H2 章节标题 | 22px | 600 | 1.2 |
| H3 卡片标题 | 17px | 600 | 1.25 |
| H4 副标题 | 15px | 500 | 1.35 |
| 正文中文 | 13px | 400 | 1.65 |
| 正文英文 | 11-12px | 400 | 1.65 |
| 标签 | 11px | 500 | 1.2 |
| 代码/时间 | 11-12px | 500 | 1.2 |

### 双语规则

- 中文在上，英文在下（垂直堆叠）
- 字号差不超过 2px（如中文 13px / 英文 11px）
- 颜色对比一致（同为 `--ink-secondary` 或 `--ink-tertiary`）
- 中文正文使用 `--font-body`（PingFang SC），英文标签可使用 `--font-display`（Fraunces）
- 标题双语均使用 `--font-display`

### 字体降级方案

- Fraunces via Google Fonts（`font-display: swap`） → Songti SC（macOS） → STSong → SimSun（Windows） → serif
- PingFang SC → Microsoft YaHei → sans-serif
- JetBrains Mono → Courier New → monospace

## 5. 间距阶梯 (Spacing Scale)

| Token | 值 | 用途 |
|-------|------|------|
| 页面水平 padding | 20px | 页面左右边距 |
| 卡片 padding | 16-20px | 卡片内边距 |
| 组件间距 | 8-12px | chip 之间、按钮之间 |
| 章节间距 | 20px | 偏好组之间、卡片之间 |
| 顶部栏高度 | 44px | sticky header |
| CTA 高度 | 52px | 底部固定按钮 |
| 触控最小尺寸 | 44px | 所有可点击元素 |
| 桌面顶栏 | 64px | desktop header |
| 桌面底栏 | 48px | desktop footer |

## 6. 圆角阶梯 (Radius Scale)

| Token | 值 | 用途 |
|-------|------|------|
| `--radius-sm` | 4px | 小标签、小按钮 |
| `--radius-md` | 8px | 卡片、按钮、chip |
| `--radius-lg` | 12px | 大卡片、hero 区、底部 sheet 顶部 |
| `--radius-full` | 9999px | 圆形徽标、语言切换、拖拽手柄 |
| 印章 | 圆形 | `border-radius: 50%` |
| 设备框架（桌面页） | 24px | mobile mockup 设备外框 |

## 7. 阴影 (Elevation)

| Token | 值 | 用途 |
|-------|------|------|
| `--shadow-card` | `0 1px 3px rgba(18,59,58,0.04)` | 静态卡片 |
| `--shadow-raised` | `0 4px 16px rgba(18,59,58,0.06)` | 浮层、拖拽 sheet、设备框架 |
| `--shadow-stamp` | `0 2px 8px rgba(18,59,58,0.08)` | 印章封印墨迹效果 |

阴影 alpha 上限：0.06（静态）/ 0.08（浮层/印章）。静态卡片优先使用 border-led 而非阴影。

## 8. 图标规则 (Icon Rules)

- 图标库：Lucide（已由 `fill-html-head.mjs` 加载 CDN）
- 图标风格：line（outline），stroke-width 1.5-2
- 尺寸阶梯：
  - 12px：标签内、提示内
  - 14px：提示
  - 16px：按钮、标签
  - 18px：按钮内、价值要点
  - 20px：导航、返回
- 禁止使用 emoji 作为图标
- 禁止使用其他图标库
- 自定义 SVG 仅限：路线折线、编号标记、印章封印、虚线分割线端点
- 功能色绑定：
  - 文化提示图标：Lucide `lightbulb`，颜色 `--accent-tip`（`#D39A3A`）
  - 活动图标：Lucide `calendar` / `ticket`，颜色 `--accent-activity`（`#E66A45`）
  - 导航图标：Lucide `navigation` / `map-pin`
  - 通用图标：Lucide `clock`、`route`、`languages`、`compass`、`target`、`share`、`arrow-right`、`chevron-left`、`grip-horizontal`、`plus`、`minus`、`locate`、`database`

## 9. 摄影规则 (Photography Rules)

- 仅使用 6 张现有社区真实照片，不新增
- 图片处理：`object-fit: cover`，`loading="lazy"`
- 图片圆角：与所在卡片一致（`--radius-md` 8px）
- 禁止使用插图、3D 渲染、AI 生成图、stock photo

| 图片 | 用途 |
|------|------|
| `community-street-warm.jpg` | 评委入口 hero、桌面概览缩略 |
| `community-aerial.jpg` | 路线页地图底图、桌面概览 |
| `community-event.jpg` | Stop 1 社区中心卡片 |
| `community-cafe.jpg` | Stop 2 咖啡馆卡片 |
| `community-park.jpg` | 路线完成页/桌面概览 |
| `community-market.jpg` | Stop 3 农贸市场卡片 |

## 10. 响应式规则 (Responsive Rules)

- 移动端页面：固定 390×844 画布
- 桌面端页面：固定 1440×900 画布
- 移动端内联容器：`max-width: 390px`（居中）
- 桌面端内联容器：`max-width: 1440px`（居中）
- 字号不使用流式单位（rem/vw），全部使用 px
- 不使用媒体查询断点（设计原型固定尺寸）
- safe-area-inset: `env(safe-area-inset-bottom, 24px)`

## 11. 动效规则 (Motion Rules)

| 交互 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| chip 选中 | border-color + background 变化 | 150ms | `cubic-bezier(.2,.8,.2,1)` |
| chip 点击 | `scale(0.97)` | 100ms | `cubic-bezier(.2,.8,.2,1)` |
| CTA hover | background 变暗 | 150ms | `cubic-bezier(.2,.8,.2,1)` |
| CTA 点击 | `scale(0.99)` | 100ms | `cubic-bezier(.2,.8,.2,1)` |
| 印章 hover | `rotate(-5deg) + scale(1.02)` | 320ms | `cubic-bezier(.3,0,0,1)` |
| 底部 sheet 拖拽 | `translate Y` | 300ms | `cubic-bezier(.2,.8,.2,1)` |
| 当前站点脉冲 | ring `scale(1.45) + opacity(0)` | 1800ms | `ease-out infinite` |

动效强度：低（motionIntensity: 2）。动效仅用于状态反馈，不用于装饰。

降级规则：
- `prefers-reduced-motion: reduce` 时所有 `transition-duration: 0.01ms`
- `pointer: coarse` 时取消 hover transform

## 12. 无障碍规则 (Accessibility Rules)

- 所有可交互元素最小触控区域 44×44px
- 焦点可见：`focus-visible` outline `2px solid var(--brand-primary)`，offset 2-3px
- 图片 alt 属性双语描述
- 颜色对比度：
  - `--ink-primary` (#263331) on `--surface-base` (#F6F0E5)：对比度 > 12:1（AAA）
  - `--ink-secondary` (#5C6B68) on `--surface-base` (#F6F0E5)：对比度 > 5:1（AA）
  - 白字 on `--brand-primary` (#0F766E)：对比度 > 4.5:1（AA）
  - `--accent-activity` (#E66A45) on `--surface-paper` (#FBF8F1)：对比度 > 3.5:1（AA Large）
- 语义化 HTML：`header`、`main`、`section`、`article`、`footer`
- ARIA：按钮有 `aria-label`，图标有 `aria-hidden="true"`
- 语言切换有明确的选中状态指示

## 13. 页面逐屏说明 (Page-by-Page)

### 页面 1：评委入口 (01-judge-entry.html)

- 画布：390×844
- 目标：评委/访客 10 秒内理解产品价值
- 组成：
  - sticky 顶栏（44px）：桐邻 logo + 语言切换 + 评委模式标识
  - Hero 区（~380px）：`community-street-warm.jpg` 全宽照片 + 暖渐变蒙层 + 双语标题 + 手写感路由标注 + "120 min · 3 stops" 徽标
  - 价值主张区：H1 "桐邻 First 120 Minutes"（Fraunces 26px）+ H2 英文副标 + 3 条价值要点（Lucide route/database/languages 图标）
  - sticky CTA（52px）："开始探索 / Start Exploring"
- 交互：语言切换、开始探索 CTA
- 图片：`community-street-warm.jpg`

### 页面 2：偏好构建 (02-preference-builder.html)

- 画布：390×844
- 目标：用户 30 秒内完成偏好选择并生成路线
- 组成：
  - sticky 顶栏（44px）：返回 + "偏好设置 / Preferences" + 语言切换
  - 介绍区：步骤标签 "STEP 01" + H2 双语标题 + 虚线分割
  - 5 个偏好选择组：
    1. 语言偏好：中文 / English / 双语
    2. 兴趣（多选）：美食 / 文化 / 户外 / 社交
    3. 可用时间（单选）：1h / 2h / 3h
    4. 步行距离（单选）：500m / 1km / 2km
    5. 融入目标（单选）：认识社区 / 参与活动 / 结交邻里
  - sticky CTA（52px）："生成我的路线 / Generate My Route"
- 交互：chip 多选/单选、生成路线 CTA

### 页面 3：两小时路线 (03-two-hour-route.html)

- 画布：390×844
- 目标：用户按路线完成 3 个站点的社区探索
- 组成：
  - sticky 顶栏（44px）：返回 + "你的路线 / Your Route" + 语言切换
  - 地图区（380px）：`community-aerial.jpg` + 半透明白叠加 + SVG 路线折线 + 编号标记 1/2/3 + 当前位置脉冲
  - 路线信息条（48px）："3 stops · 1.5 km · 120 min" + 拖拽手柄提示
  - 可拖拽底部 sheet（~380px）：
    - Stop 1（10:00）：`community-event.jpg`，社区中心，文化标签，文化提示（`--accent-tip`），"了解详情" 按钮
    - Stop 2（10:40）：`community-cafe.jpg`，咖啡馆，美食标签，文化提示，"导航" 按钮
    - Stop 3（11:30）：`community-market.jpg`，农贸市场，活动标签（`--accent-activity`），"加入活动" 全宽按钮
- 交互：地图缩放、底部 sheet 拖拽、卡片内导航/详情/加入活动
- 图片：`community-aerial.jpg`、`community-event.jpg`、`community-cafe.jpg`、`community-market.jpg`

### 页面 4：路线完成 (04-route-completed.html)

- 画布：390×844
- 目标：提供路线完成的仪式感反馈
- 组成：
  - sticky 顶栏（44px）：返回 + "路线完成 / Route Complete" + 语言切换
  - 虚线装饰框架（Direction A 风格 dashed border + 端点圆点）
  - 完成封印（120px 圆形印章）：
    - 外环：3px solid `--brand-primary`
    - 内环：1px dashed `--brand-primary`（呼应 A 的虚线分割线）
    - 内含：check 图标 + "融入完成"（Songti SC）+ "ROUTE COMPLETE"（Fraunces）
    - 旋转 -8 度
    - `--shadow-stamp` 墨迹效果
    - hover：`rotate(-5deg) + scale(1.02)`
  - 完成文案区：时间戳 + H2 双语 + 描述
  - 统计区："3 地点 · 2 文化提示 · 1 活动报名"
  - 站点印章收集：3 个小圆（28px，brand-primary 底，白勾）
  - 分享 CTA（44px）："分享我的路线 / Share My Route"（outline 样式）
- 印章特征：圆形、虚线内环、衬线字体、-8 度旋转、brand-primary 色

### 页面 5：桌面概览 (05-desktop-overview.html)

- 画布：1440×900
- 目标：向评委展示完整产品设计价值
- 组成：
  - 顶栏（64px）：logo + 项目标题 + 语言切换 + 评委标识
  - 左栏（560px）：
    - 章节标签 "PROJECT / 项目"
    - H1 "桐邻 First 120 Minutes"（Fraunces 40px）+ H2 英文副标
    - 虚线分割线 + 价值描述段
    - 4 条价值要点（Lucide 图标 + 双语标题）
    - 3 张社区照片缩略图行（120×80，radius 8px）
  - 右栏（flex:1，surface-paper 底）：
    - 标题 "交互流程 / Interaction Flow"
    - 4 个移动 mockup（220×400，设备框架 radius 24px + shadow-raised）
    - 每个 mockup 对应一个移动页面的缩略内容
    - mockup 之间用 Lucide arrow-right 连接
  - 底栏（48px）："桐邻 · Tonglin Guide" + "Direction A · Editorial Handbook · Refined"
- 图片：`community-street-warm.jpg`、`community-cafe.jpg`、`community-park.jpg`

## 14. 组件状态说明 (Component States)

### Chip 选择器

| 状态 | 背景 | 边框 | 文字 | 变化 |
|------|------|------|------|------|
| 默认 | `--surface-paper` | `--border-default` | `--ink-primary` | — |
| 选中 | `--brand-primary` | `--brand-primary` | `#FFFFFF` | — |
| hover（非选中） | `--surface-paper` | `--brand-primary` | `--ink-primary` | border-color 变化 |
| active | — | — | — | `scale(0.97)` |
| focus-visible | — | — | — | outline 2px `--brand-primary` offset 2px |

### CTA 按钮

| 状态 | 背景 | 文字 | 变化 |
|------|------|------|------|
| 默认 | `--brand-primary` | `#FFFFFF` | — |
| hover | `--brand-primary-dark` | `#FFFFFF` | background 变暗 |
| active | — | — | `scale(0.99)` |
| focus-visible | — | — | outline 2px `--brand-primary` offset 3px |
| disabled | `--ink-tertiary` | `--surface-base` | opacity 0.5 |

### 路线卡片

| 状态 | 边框 | 阴影 | 变化 |
|------|------|------|------|
| 默认 | `--border-default` | `--shadow-card` | — |
| 当前站点 | `--brand-primary` 2px | `--shadow-card` | 边框加粗变色 |
| 已完成 | `--border-soft` | none | 灰阶降低 |
| hover | `--brand-primary` | `--shadow-card` | border-color 变化 |

### 印章封印

| 状态 | 旋转 | 缩放 | 变化 |
|------|------|------|------|
| 默认 | -8deg | 1.0 | — |
| hover | -5deg | 1.02 | rotate + scale |
| hover（触控） | -8deg | 1.0 | 无变化 |

### 活动标签

| 状态 | 背景 | 文字 |
|------|------|------|
| 默认 | `--accent-activity-tint` | `--accent-activity` |
| hover | `--accent-activity` | `#FFFFFF` |

### 文化提示

| 状态 | 左边框 | 图标颜色 | 文字颜色 |
|------|--------|---------|---------|
| 默认 | 2px `--accent-tip` | `--accent-tip` | `--ink-secondary` |

## 15. 明确禁止事项 (Forbidden Items)

1. 禁止紫色/蓝紫色渐变
2. 禁止 emoji 图标
3. 禁止非 Lucide 图标库
4. 禁止 AI 生成图/stock photo/插画风图片
5. 禁止 5 个站点（必须 3 个，编号 1/2/3）
6. 禁止使用 `--accent-activity` 色用于非活动元素
7. 禁止使用 `--accent-tip` 色用于非文化提示元素
8. 禁止中英文使用不同视觉权重（字号差 > 2px 或颜色对比不一致）
9. 禁止触控区域 < 44px
10. 禁止阴影 alpha > 0.08
11. 禁止圆角 > 12px（印章圆形除外）
12. 禁止使用 Noto Serif SC / Noto Sans SC（改用 Fraunces + Songti SC / PingFang SC）
13. 禁止修改 `apps/mobile` 代码（仅设计和文档）
14. 禁止使用与核心路线无关的页面

## 16. 关联文档

- `selected-direction.md`：方向选择记录
- `screen-flow.md`：屏幕流转图
- `trae-first-120-minutes-refined/`：精炼设计项目
- `trae-first-120-minutes/`：三方向视觉探索项目（参考用）

## 备注

本文件为精炼版设计总纲，对应 `trae-first-120-minutes-refined` 设计项目。具体组件拆分与交互细节在后续 OpenSpec 阶段细化。