# 比赛 H5 屏幕流转

```text
Welcome
  ├─ 30 秒示例 ─────────────┐
  └─ 为我制定计划          │
       ↓                   │
Preferences 1：语言        │
       ↓                   │
Preferences 2：首要兴趣（单选）
       ↓
Preferences 3：到达阶段 + 家庭结构（单选）
       ↓
Preferences 4：参与需求（单选，含 none）
       ↓
Curated matching loading
       ↓
Plan：摘要 + 四条理由 + 第一行动
       ↓
Route list ──> Place detail ──> Mark Visited
       ↓
Demo Confirm（仅本地状态）
       ↓
Finish Route
       ↓
Complete：地点 1/1 + 活动 1/1
       └─ Start Over → Welcome
```

## 路由

| 屏幕 | 路由 | 关键状态 |
| --- | --- | --- |
| Welcome | `/pages/onboarding/welcome` | 访客入口、语言 |
| Preferences | `/pages/onboarding/preferences` | 四步单选草稿、普通 API 错误 |
| Plan | `/pages/onboarding/plan` | 摘要、四条理由、路线、在线/离线提示 |
| Route | `/pages/onboarding/route-map` | 地图增强 + 永远可用的路线清单 |
| Place | `/pages/places/detail?id=...` | 公开地点详情；404 返回明确状态 |
| Complete | `/pages/onboarding/complete` | 1/1 地点、1/1 演示活动、重新开始 |

## 状态边界

- 4xx：显示本地化错误，不离线回退。
- transport、timeout、5xx：同版本本地目录匹配，只显示离线 badge。
- 地图 SDK 失败不阻断路线清单。
- 刷新或深链缺少内存 plan 时返回 Welcome。
- 微信小程序保留既定非比赛入口边界；比赛主流程只在 H5 展示。
