# 阶段 03 摘要 - UI设计

> PRD_001 | 可视化模块

## 核心结论

设计 Dashboard 页面，包含 **12 个新建组件**，支持 Desktop/Tablet/Mobile 三端响应式布局。采用赛博朋克风格，矩阵绿为主色调。

## 关键产出

### 组件清单

| 组件 | 类型 | 优先级 | 规格文件 |
|------|------|--------|----------|
| TimeRangeSelector | 控件 | P0 | ✅ |
| StatsCard | 卡片 | P0 | ✅ |
| StreakCard | 卡片 | P0 | (复用 StatsCard) |
| GoalRateCard | 卡片 | P0 | (复用 StatsCard) |
| WeekCompareCard | 卡片 | P0 | (复用 StatsCard) |
| TrendLineChart | 图表 | P0 | ✅ |
| CalendarHeatmap | 图表 | P0 | ✅ |
| GoalProgressRing | 图表 | P0 | ✅ |
| CategoryPieChart | 图表 | P1 | 待定义 |
| ChartTooltip | 辅助 | P0 | 内置 |
| EmptyState | 辅助 | P0 | 通用 |
| DayDetailModal | 弹窗 | P0 | 待定义 |

### 布局规格

| 端 | 断点 | 卡片列数 | 图表列数 |
|----|------|----------|----------|
| Desktop | >1024px | 4 | 2 |
| Tablet | 640-1024px | 2 | 1 |
| Mobile | <640px | 2 | 1 (横滚) |

### 设计变量引用

- 主色: `brand.matrix` (#00FF41)
- 次强调: `brand.alert` (#FF6B35)
- 信息色: `brand.cyber` (#00D4FF)
- 背景: `bg.carbon` (#1A1A1A)
- 字体: Press Start 2P (标题) + JetBrains Mono (数据)

## 供后续阶段使用

### 04-技术设计 需要
- 组件 Props 接口定义
- 数据结构需求
- API 响应格式

### 05c-前端 需要
- 组件结构和规格
- 布局 CSS Grid 配置
- 动画规格
- 响应式断点

## 注意事项

1. **图表库** - 需在04阶段确定选型
2. **热力图横滚** - Mobile 端需支持
3. **空状态** - 每个组件需独立处理
4. **HTML预览** - 可在浏览器打开验收

## 关键词索引

| 关键词 | 位置 |
|--------|------|
| TimeRangeSelector | components/time-range-selector.md |
| StatsCard | components/stats-card.md |
| TrendLineChart | components/trend-line-chart.md |
| CalendarHeatmap | components/calendar-heatmap.md |
| GoalProgressRing | components/goal-progress-ring.md |
| Desktop布局 | layouts/dashboard.md |
| Mobile布局 | layouts/dashboard.md |
| 预览 | preview/index.html |
