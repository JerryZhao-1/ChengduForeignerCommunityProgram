# 屏幕流转图

## 主流转

```
[首屏：融入路线引导]
       │
       ├─ Step 1 ──> [events 列表] ──> [event 详情] ──> [报名]
       │
       ├─ Step 2 ──> [places 地图] ──> [marker 摘要卡] ──> [place 详情] ──> [导航]
       │
       ├─ Step 3 ──> [discover 列表] ──> [帖子详情] ──> [评论]
       │
       └─ Step 4 ──> [language-settings] ──> [切换 English] ──> [回到首屏验证]
```

## 屏幕清单

| 屏幕 | 路由 | 现有/新增 | 说明 |
|------|------|-----------|------|
| 首屏引导 | `/pages/home/index` | 现有（增强） | 增加融入路线引导组件 |
| 活动列表 | `/pages/events/index` | 现有 | |
| 活动详情 | `/pages/events/detail` | 现有 | |
| 活动报名 | `/pages/events/signup` | 现有 | |
| 地点地图 | `/pages/places/map` | 现有 | |
| 地点详情 | `/pages/places/detail` | 现有 | |
| 发现列表 | `/pages/discover/index` | 现有 | |
| 帖子详情 | `/pages/discover/detail` | 现有 | |
| 语言设置 | `/pages/more/language-settings` | 现有 | |

## 备注

本文件为骨架设计，具体路由参数与组件拆分在后续 03-openspec 阶段细化。新增组件以现有页面内增强为主，不新增独立路由页。
