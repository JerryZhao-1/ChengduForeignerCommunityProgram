# 实施计划 — 桐邻 First 120 Minutes 精炼设计（Direction A 编辑风格 + Direction B 完成印章）

## Summary

采用 Direction A "成都社区探索手册"编辑风格为基底，吸收 Direction B "国际邻里通行证"的路线完成印章隐喻，创建一个包含 4 个移动端高保真页面 + 1 个桌面适配页的精炼设计项目，同时输出完整的设计规范文档 `docs/competition/design/DESIGN.md`。仅做设计与文档，不修改 `apps/mobile`。

## Current State Analysis

- 现有三方向探索项目位于 `trae-first-120-minutes/`，包含 6 页 + 6 张社区摄影素材
- `docs/competition/design/DESIGN.md` 现为 43 行骨架草稿，需替换为完整规范
- 仓库 `apps/mobile/src/App.vue` 使用 `"PingFang SC", "Microsoft YaHei", sans-serif` 字体栈
- `fill-html-head.mjs` 脚本生成 HTML `<head>`（Tailwind CDN 4.3.1 + Lucide 1.8.0 + Google Fonts + theme-vars + @theme inline）
- 现有 Direction A 页面使用 `Noto Serif SC`，需改为 `Fraunces + Songti SC`

## Proposed Changes

### 项目结构（新建）

```
trae-first-120-minutes-refined/
├── trae-first-120-minutes-refined.design   (freeSize 项目, 5 页面 + 6 图片节点)
├── colors_and_type.css                      (新调色板 token)
├── orchestration-summary.json               (项目编排摘要)
├── assets/                                   (复用 6 张社区照片)
│   ├── community-aerial.jpg
│   ├── community-cafe.jpg
│   ├── community-event.jpg
│   ├── community-market.jpg
│   ├── community-park.jpg
│   └── community-street-warm.jpg
└── pages/
    ├── 01-judge-entry.html                  (mobile 390×844)
    ├── 02-preference-builder.html            (mobile 390×844)
    ├── 03-two-hour-route.html                (mobile 390×844)
    ├── 04-route-completed.html              (mobile 390×844)
    └── 05-desktop-overview.html              (desktop 1440×900)
```

文档更新：`docs/competition/design/DESIGN.md`（替换现有骨架）

### 步骤 1：创建项目骨架（.design + CSS + orchestration-summary + 图片复制）

**1a. 创建 `.design` 文件**
- `deviceType: "freeSize"`（同时容纳 390×844 和 1440×900 画布）
- 5 个 page 节点（group 0 = 移动端 4 页，group 1 = 桌面端 1 页）
- 6 个 image 节点（复用现有社区照片）
- 每个节点包含完整 `devMetadata`（`htmlSrc` / `imageSrc` + `interactions`）

**1b. 创建 `colors_and_type.css`（新调色板）**

关键 token（与旧调色板的差异）：
- `--brand-primary: #0F766E`（不变）
- `--brand-primary-dark: #123B3A`（新，旧 `#134E4A`）
- `--surface-base: #F6F0E5`（新暖奶油，旧 `#FAF6F0`）
- `--surface-paper: #FBF8F1`（新，旧 `#FFFDF8`）
- `--ink-primary: #263331`（新 teal-gray，旧 `#292524`）
- `--ink-secondary: #5C6B68`（新，旧 `#78716C`）
- `--accent-activity: #E66A45`（新增，活动专用赤陶色）
- `--accent-activity-tint: #FCE8E0`
- `--accent-tip: #D39A3A`（新增，文化提示专用琥珀色）
- `--accent-tip-tint: #F7EDD8`
- `--font-display: "Fraunces", "Songti SC", "STSong", "SimSun", serif`（新，旧 `Noto Serif SC`）
- `--font-body: "PingFang SC", "Microsoft YaHei", sans-serif`（与 App.vue 一致）
- `--font-mono: "JetBrains Mono", "Courier New", monospace`
- `--shadow-stamp: 0 2px 8px rgba(18,59,58,0.08)`（新增，印章墨迹效果）
- 包含 `.dark` 暗色模式覆盖

**1c. 创建 `orchestration-summary.json`**
- `deviceType: "freeSize"`, `operatingMode: "free-explore"`
- `styleContinuityAnchors` 包含完整色/形/字/间距/组件/表面/图像/交互锚点
- 5 个页面定义，每个含 `visualNorthStar` + `compositionPattern` + `continuityAnchors`

**1d. 复制图片资源**
- 从 `trae-first-120-minutes/assets/` 复制 6 张 jpg 到 `trae-first-120-minutes-refined/assets/`
- 验证：`ls -la` 确认 6 个文件存在

### 步骤 2：并行生成 5 个 HTML 页面

5 个页面互相独立，可并行 dispatch。每个页面先运行 `fill-html-head.mjs` 生成骨架，再填充 `<main>` 内容。

#### 页面 1：评委入口 `01-judge-entry.html`（390×844）

- **目标**：评委/访客 10 秒内理解产品价值
- **结构**：
  - sticky 顶栏(44px)：桐邻 logo + 语言切换 + 评委模式标识
  - Hero 区(~380px)：`community-street-warm.jpg` 全宽照片 + 暖渐变蒙层 + 双语标题 + 手写感路由标注
  - 价值主张区：H1 "桐邻 First 120 Minutes"(Fraunces) + H2 英文副标 + 3 条价值要点(Lucide route/database/languages 图标)
  - sticky CTA(52px)："开始探索 / Start Exploring"
- **图片**：community-street-warm.jpg
- **状态**：State 1 — 评委/游客首屏

#### 页面 2：偏好构建 `02-preference-builder.html`（390×844）

- **目标**：用户 30 秒内完成偏好选择
- **结构**：
  - sticky 顶栏(44px)：返回 + "偏好设置 / Preferences" + 语言切换
  - 介绍区：步骤标签 "Step 01" + H2 双语标题 + 虚线分割
  - 5 个偏好选择组（每组 Lucide 图标 + 标签 + chips）：
    1. 语言偏好：中文 / English / 双语
    2. 兴趣(多选)：美食 / 文化 / 户外 / 社交
    3. 可用时间(单选)：1h / 2h / 3h
    4. 步行距离(单选)：500m / 1km / 2km
    5. 融入目标(单选)：认识社区 / 参与活动 / 结交邻里
  - sticky CTA(52px)："生成我的路线 / Generate My Route"
- **状态**：State 2 — 偏好选择

#### 页面 3：两小时路线 `03-two-hour-route.html`（390×844）

- **目标**：用户按路线完成 3 个站点的社区探索
- **结构**：
  - sticky 顶栏(44px)：返回 + "你的路线 / Your Route" + 语言切换
  - 地图区(上半屏 ~380px)：`community-aerial.jpg` + 半透明白叠加 + SVG 路线折线 + 编号标记 1/2/3(圆形 brand-primary 底白字)
  - 路线信息条(48px)："3 stops · 1.5 km · 120 min" + 拖拽手柄提示
  - 可拖拽底部 sheet(~380px)：
    - 拖拽手柄(40px 宽, 4px 高, radius-full)
    - 3 个路线卡片（编辑风格，左侧时间轴编号 1/2/3 + 右侧卡片内容）：
      - Stop 1(10:00)：community-event.jpg, 社区中心, 文化标签, 文化提示(accent-tip 色 + Lucide lightbulb)
      - Stop 2(10:40)：community-cafe.jpg, 咖啡馆, 美食标签, 文化提示
      - Stop 3(11:30)：community-market.jpg, 农贸市场, 活动标签(accent-activity 色), "加入活动" CTA
- **关键差异**：站点从 5 改为 3，编号 1/2/3；地图上半 + 拖拽卡片下半；活动用 #E66A45，提示用 #D39A3A
- **状态**：State 3 — AI 社区路线地图

#### 页面 4：路线完成 `04-route-completed.html`（390×844）

- **目标**：提供路线完成的仪式感反馈
- **结构**：
  - sticky 顶栏(44px)：返回 + "路线完成 / Route Complete" + 语言切换
  - 虚线装饰框架（Direction A 风格，dashed border + 端点圆点）
  - 完成封印(120px 圆形印章)：
    - 外环：3px solid brand-primary 圆
    - 内环：1px dashed brand-primary 圆（呼应 A 的虚线分割线，非 B 的实线双环）
    - 内含：Lucide check-circle 图标 + "融入完成"(Songti SC 衬线) + "ROUTE COMPLETE"(Fraunces 衬线, 字距 0.08em)
    - 旋转 -8 度（B 是 -15 度，更克制）
    - shadow-stamp 微妙墨迹效果
    - hover: rotate(-5deg) + scale(1.02)
  - 完成文案区：时间戳 + H2 双语 + 描述
  - 统计区："3 地点 · 2 文化提示 · 1 活动报名"
  - 站点印章收集：3 个小圆(28px, brand-primary 底, 白勾)
  - 分享 CTA："分享我的路线 / Share My Route"(outline 样式)
- **印章融入策略**：将 B 的"通行证盖章"转化为 A 的"手册完成封印"——圆形保留但内环改虚线，字体改衬线，旋转更克制，外围用 A 的虚线装饰框架
- **状态**：State 4 — 路线完成结果

#### 页面 5：桌面概览 `05-desktop-overview.html`（1440×900）

- **目标**：向评委展示完整产品设计价值
- **结构**：
  - 顶栏(64px)：logo + 项目标题 + 语言切换 + 评委标识
  - 左栏(560px)：产品价值说明
    - 章节标签 "PROJECT / 项目"
    - H1 "桐邻 First 120 Minutes"(Fraunces 40px) + H2 英文副标
    - 虚线分割线 + 价值描述段
    - 4 条价值要点(Lucide 图标 + 双语标题)
    - 3 张社区照片缩略图行(120×80, radius 8px)
  - 右栏(flex:1, surface-paper 底)：
    - 标题 "交互流程 / Interaction Flow"
    - 4 个移动 mockup(220×460, 设备框架 radius 24px + shadow-raised)
    - 每个 mockup 对应一个移动页面的缩略内容
    - mockup 之间用 Lucide arrow-right 连接
  - 底栏(48px)："桐邻 · Tonglin Guide" + "Direction A · Editorial Handbook · Refined"

### 步骤 3：更新 `docs/competition/design/DESIGN.md`

替换现有 43 行骨架，写入完整 16 章节设计规范：

1. Purpose Statement — 设计目标与核心指标
2. Aesthetic Direction — 编辑手册风格定义
3. Color Tokens — 品牌色/背景/文字/功能强调色/边框（含表格）
4. Typography — 字体栈/字号阶梯/双语规则
5. Spacing Scale — 页面/卡片/组件间距/触控尺寸
6. Radius Scale — 4/8/12px + 印章圆形
7. Elevation — 三级阴影 + alpha 上限
8. Icon Rules — Lucide 限定 + 尺寸阶梯 + 功能色绑定
9. Photography Rules — 6 张照片用途分配 + 处理规则
10. Responsive Rules — 固定画布尺寸 + 内联容器
11. Motion Rules — 交互动效表 + 降级规则
12. Accessibility Rules — 触控/对比度/语义化/ARIA
13. 页面逐屏说明 — 5 个页面结构/目标/交互/图片
14. 组件状态说明 — Chip/CTA/路线卡片/印章的状态表
15. 明确禁止事项 — 14 条禁止项
16. 关联文档

### 步骤 4：验证

运行 `scan-design-directory.mjs` 验证：
```bash
node /Users/jerry/.trae-cn/builtin/design/default/skills/solo-design/script/scan-design-directory.mjs \
  /Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/trae-first-120-minutes-refined \
  --expected-pages=5
```

验证清单：
- .design 文件 JSON 合法，5 页面 + 6 图片节点存在
- 所有 HTML 文件非空且 `<main>` 内容已填充
- 所有图片文件存在于 `assets/`
- colors_and_type.css token 值正确
- DESIGN.md 包含 16 个章节
- 无 emoji（全文搜索）
- 无紫色/蓝紫色渐变
- 站点编号为 1/2/3（非 1-5）
- 所有按钮 ≥ 44px
- 双语字号差 ≤ 2px

## Assumptions & Decisions

1. **Fraunces 优于 Lora**：Fraunces 的光学尺寸轴(opsz 9-144)在大标题处自动增强衬线对比度，小正文处自动收敛，与 Songti SC 旧风格衬线气质统一，更适合编辑手册方向。
2. **freeSize 项目类型**：使用 `deviceType: "freeSize"` 同时容纳 390×844 和 1440×900 画布。如不支持，回退为 `deviceType: "mobile"` + 桌面页内联 `max-width: 1440px`。
3. **功能强调色语义化使用**：`--accent-activity` (#E66A45) 仅用于活动标签和活动按钮，`--accent-tip` (#D39A3A) 仅用于文化提示图标和文字。不作为品牌色使用。
4. **印章融入策略**：将 B 的"通行证盖章"转化为 A 的"手册完成封印"——保留圆形但内环改虚线(呼应 A 的虚线分割线)，字体改衬线(Fraunces/Songti SC)，旋转从 -15° 减为 -8°，外围加 A 风格虚线装饰框架。
5. **站点数 3**：用户明确要求编号 1/2/3，从原 Direction A 的 5 站精简为 3 站。
6. **字体降级**：Fraunces via Google Fonts(`font-display: swap`) → Songti SC(macOS) → STSong → SimSun(Windows) → serif。PingFang SC → Microsoft YaHei → sans-serif。
7. **不修改 apps/mobile**：仅创建设计项目和文档，不触碰任何 app 源码。
