# 功能流程图

> PRD_001 | 可视化模块

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Dashboard Page                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 时间选择器  │  │ 刷新按钮   │  │     导出按钮        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │今日统计  │ │连续天数  │ │目标达成率│ │ 周对比   │       │
│  │   Card   │ │   Card   │ │   Card   │ │   Card   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   行为趋势折线图                      │    │
│  │              (支持类型筛选 + Hover 详情)              │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │     活跃度热力图        │  │      目标进度环组       │  │
│  │   (12个月日历视图)      │  │   (多个环形进度条)      │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   分类分布饼图 (P1)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```mermaid
flowchart TB
    subgraph Client["前端"]
        Page[Dashboard Page]
        Hook[useDashboardStats Hook]
        Cards[概览卡片组]
        Charts[图表组件]
    end

    subgraph API["API Layer"]
        StatsAPI["/api/dashboard/stats"]
        TrendAPI["/api/dashboard/trends"]
        HeatmapAPI["/api/dashboard/heatmap"]
        GoalsAPI["/api/goals"]
    end

    subgraph Service["服务层"]
        DashboardService[DashboardService]
        BehaviorService[BehaviorService]
        GoalService[GoalService]
    end

    subgraph DB["数据库"]
        Records[(behavior_records)]
        Goals[(goals)]
        Definitions[(behavior_definitions)]
    end

    Page --> Hook
    Hook --> StatsAPI
    Hook --> TrendAPI
    Hook --> HeatmapAPI
    Hook --> GoalsAPI

    StatsAPI --> DashboardService
    TrendAPI --> DashboardService
    HeatmapAPI --> DashboardService
    GoalsAPI --> GoalService

    DashboardService --> BehaviorService
    BehaviorService --> Records
    BehaviorService --> Definitions
    GoalService --> Goals

    Hook --> Cards
    Hook --> Charts
```

## 用户交互流

### 流程 1: 首次加载

```mermaid
sequenceDiagram
    participant U as 用户
    participant P as Dashboard
    participant A as API
    participant S as Service
    participant D as Database

    U->>P: 进入 Dashboard
    P->>P: 显示骨架屏

    par 并行请求
        P->>A: GET /stats
        P->>A: GET /trends?range=7d
        P->>A: GET /heatmap
        P->>A: GET /goals
    end

    A->>S: 调用服务
    S->>D: 查询数据
    D-->>S: 返回结果
    S-->>A: 返回统计
    A-->>P: JSON 响应

    P->>P: 渲染卡片
    P->>P: 渲染图表
    P-->>U: 完整 Dashboard
```

### 流程 2: 切换时间范围

```mermaid
sequenceDiagram
    participant U as 用户
    participant P as Dashboard
    participant A as API

    U->>P: 点击时间选择器
    P->>P: 显示下拉选项
    U->>P: 选择"30天"
    P->>P: 图表显示加载态
    P->>A: GET /trends?range=30d
    A-->>P: 返回30天数据
    P->>P: 更新趋势图
    P-->>U: 显示新数据
```

### 流程 3: 热力图钻取

```mermaid
sequenceDiagram
    participant U as 用户
    participant P as Dashboard
    participant M as Modal
    participant A as API

    U->>P: Hover 热力图格子
    P-->>U: 显示 Tooltip (日期+数量)
    U->>P: 点击格子
    P->>A: GET /behaviors?date=2026-01-20
    A-->>P: 返回当日行为列表
    P->>M: 打开详情弹窗
    M-->>U: 显示行为列表
    U->>M: 关闭弹窗
    M->>P: 返回 Dashboard
```

### 流程 4: 目标进度钻取

```mermaid
sequenceDiagram
    participant U as 用户
    participant P as Dashboard
    participant E as Expandable

    U->>P: 点击目标进度环
    P->>E: 展开详情区域
    E-->>U: 显示关联行为列表
    U->>E: 再次点击
    E->>P: 收起详情
```

## 状态管理

```
Dashboard State
├── timeRange: '7d' | '30d' | '90d' | 'custom'
├── customDateRange: { start: Date, end: Date }
├── selectedBehaviorType: string | null
├── expandedGoalId: string | null
└── isLoading: boolean

Derived State (TanStack Query)
├── stats: { todayCount, streakDays, goalRate, weekCompare }
├── trends: Array<{ date, count, type }>
├── heatmap: Array<{ date, count }>
└── goals: Array<{ id, name, progress }>
```

## 组件树

```
DashboardPage
├── TimeRangeSelector
├── StatsCardGroup
│   ├── TodayStatsCard
│   ├── StreakCard
│   ├── GoalRateCard
│   └── WeekCompareCard
├── TrendChart
│   ├── TypeFilter
│   └── LineChart
├── HeatmapSection
│   ├── CalendarHeatmap
│   └── DayDetailModal
├── GoalProgressSection
│   └── GoalProgressRing (multiple)
└── CategoryPieChart (P1)
```
