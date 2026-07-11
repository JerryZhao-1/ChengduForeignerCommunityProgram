# UI Guidelines

本文档是本项目微信小程序端 UI 规范入口。后台管理端继续遵循 `apps/admin` 现有 Vue 3 + Element Plus 方案，不适用本文档的组件库要求。

## 1. 组件库基准

- 微信小程序端 UI 组件库采用 TDesign MiniProgram。
- 新增页面、组件、表单、弹窗、按钮、列表、导航栏、反馈提示等 UI，应优先使用 TDesign MiniProgram 已有组件。
- 页面布局、按钮、输入框、表单、弹窗、Toast、Tab、列表、空状态、加载状态等，应优先参考 TDesign MiniProgram 的组件能力和设计风格。
- 不要随意引入其他小程序 UI 组件库。确需引入时，必须有明确理由，并同步更新 `AGENTS.md`、本文档和相关开发说明。

## 2. 自定义样式

- 项目的自定义样式应与 TDesign MiniProgram 的视觉语言保持一致。
- 自定义组件应优先组合、包装或扩展 TDesign MiniProgram 组件，避免另起一套视觉体系。
- 如果需要自定义样式，应优先通过统一主题变量、样式 token 或公共样式文件实现，避免在页面中散落大量临时样式。
- 页面级样式只保留与该页面布局强相关的最小规则；可复用的间距、颜色、字号、状态样式应沉淀到公共样式或组件中。

## 3. 开发约定

- 新增小程序 UI 前，先检查 TDesign MiniProgram 是否已有对应组件或组合模式。
- 表单、确认弹窗、Toast、加载态、空状态和列表反馈应优先保持 TDesign 默认交互语义。
- 后续迁移现有页面时，优先处理用户高频路径和 Week 5 触达的 `places` 详情、列表、地图、推荐入口、弹窗、按钮、反馈、加载和空状态。
- Week 5 `places` 模块允许使用 TDesign-compatible wrappers 或 TDesign-aligned styles 保持 H5 与 mp-weixin 构建可用；不得为这些页面引入第二套小程序 UI 组件库。
- TDesign 组件实际使用时，按 uni-app / 微信小程序构建链路配置组件引用，并在微信开发者工具中完成 npm 构建验证。

## 4. 中英双语 UI

- 所有系统拥有的标题、标签、按钮、状态、校验、Toast、加载、空和错误文案必须来自中央 Mobile catalog；中文和英文保持递归键一致。
- 页面不得用 locale 三元表达式散落硬编码文案；业务状态先使用稳定 code，再由 catalog 映射显示值。
- 正式内容按当前语言读取 `_zh` / `_en`，缺失时使用统一 fallback indicator；Discover UGC 保留原文，只本地化语言徽标与系统控件。
- Language 选择必须同时明确显示“中文 / Chinese”和“English / 英文”的可识别标签，切换后标题、Tab 与页面文案立即更新。
- 日期、数字、容量和评论数使用显式 locale 格式化，不显示原始 ISO 时间或内部状态码。
- 英文模式不能残留固定中文系统文案；中文 UGC 或正式内容 fallback 必须能由语言徽标/提示解释。
- 详细数据归属、运营修复和发布门禁见 [Mobile 中英双语运营与发布 Runbook](./mobile-bilingual-operations-and-release.md)。
