# 演示脚本

本文件定义 TRAE 大赛 H5 demo 的演示动线与讲解词。具体页面与讲解词在后续阶段细化。

## 演示环境

- 启动方式：本地 mock 模式
  ```bash
  pnpm dev:mobile
  ```
- 访问地址：`http://localhost:5174`
- 演示语言：先中文，后切换英文

## 演示动线（骨架）

### Step 1：首屏（融入路线引导）
- 打开 H5，展示"First 120 Minutes"融入路线入口
- 讲解：面向新到外籍居民的引导式体验
- 截图：`evidence/10-qa/step-01-home.png`

### Step 2：发现活动
- 进入 events，浏览本周活动
- 点击一个活动查看详情
- 讲解：活动浏览与报名闭环
- 截图：`evidence/10-qa/step-02-events.png`

### Step 3：地点导航
- 进入 places 地图视图
- 查看社区关键地点 marker
- 点击 marker 查看摘要卡
- 进入详情查看导航信息
- 截图：`evidence/10-qa/step-03-places.png`

### Step 4：社区内容流
- 进入 discover，浏览帖子列表
- 查看帖子详情与评论
- 讲解：UGC 社区连接能力
- 截图：`evidence/10-qa/step-04-discover.png`

### Step 5：语言切换
- 进入语言设置，切换至 English
- 回到首页验证双语展示
- 截图：`evidence/10-qa/step-05-i18n.png`

## 讲解要点

- 强调"可浏览、可参与、可维护"闭环
- 强调中英双语对外籍居民的友好性
- 强调基于真实社区数据契约（非硬编码）

## 备注

- 本脚本为骨架，具体页面与讲解词在后续阶段细化
- 各 Step 截图在演示排练时采集
