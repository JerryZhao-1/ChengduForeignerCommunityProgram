# 06-planner 融入路线步骤规划器

## 阶段目标

实现融入路线步骤规划器，引导用户依次完成活动发现、地点导航、社区连接等步骤。

## 预期产物

- 步骤规划器组件
- 进度指示与状态管理
- 步骤间跳转逻辑

## 状态

- [x] 规划器组件实现
- [x] 步骤跳转验证

## 验证证据

验证路径：生成预置路线 → 将地点标记为已到访 → 确认活动演示 → 完成路线。

- [`planner-place-visited.png`](./planner-place-visited.png)：地点操作后，第一站状态更新为“已到访”。
- [`planner-all-steps-complete.png`](./planner-all-steps-complete.png)：地点与活动状态均完成，“完成路线”操作可用。
- [`planner-completion-summary.png`](./planner-completion-summary.png)：进入完成页，汇总显示地点到访 `1/1`、演示确认 `1/1`。
