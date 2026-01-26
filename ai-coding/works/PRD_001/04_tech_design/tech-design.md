# 技术设计文档

> PRD_001 | 可视化模块 | 阶段 04-技术设计

## 1. 数据模型

### 1.1 现有表复用

可视化模块**不新增数据库表**，完全基于现有数据聚合查询：

| 表名 | 用途 |
|------|------|
| `neolog_behavior_records` | 行为趋势、热力图、今日统计 |
| `neolog_behavior_definitions` | 行为类型分类 |
| `neolog_goals` | 目标进度 |

### 1.2 查询视图 (逻辑层)

```sql
-- 今日统计
SELECT COUNT(*) as count, definition_id
FROM neolog_behavior_records
WHERE user_id = $1 AND DATE(recorded_at) = CURRENT_DATE
GROUP BY definition_id;

-- 连续活跃天数
WITH daily_records AS (
  SELECT DISTINCT DATE(recorded_at) as record_date
  FROM neolog_behavior_records
  WHERE user_id = $1
  ORDER BY record_date DESC
)
SELECT COUNT(*) FROM (
  SELECT record_date,
         record_date - ROW_NUMBER() OVER () * INTERVAL '1 day' as grp
  FROM daily_records
) sub WHERE grp = (SELECT MIN(grp) FROM sub);

-- 热力图数据 (12个月)
SELECT DATE(recorded_at) as date, COUNT(*) as count
FROM neolog_behavior_records
WHERE user_id = $1 AND recorded_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE(recorded_at);

-- 趋势数据
SELECT DATE(recorded_at) as date,
       definition_id,
       COUNT(*) as count
FROM neolog_behavior_records
WHERE user_id = $1 AND recorded_at BETWEEN $2 AND $3
GROUP BY DATE(recorded_at), definition_id
ORDER BY date;
```

---

## 2. API 接口

### 2.1 接口列表

| 方法 | 路径 | 说明 | 优先级 |
|------|------|------|--------|
| GET | `/api/dashboard/stats` | 概览统计 | P0 |
| GET | `/api/dashboard/trends` | 趋势数据 | P0 |
| GET | `/api/dashboard/heatmap` | 热力图数据 | P0 |
| GET | `/api/goals` | 目标列表+进度 | P0 (已存在) |

### 2.2 接口规格

#### GET /api/dashboard/stats

获取 Dashboard 概览统计数据。

**请求参数**: 无 (使用当前用户)

**响应**:
```typescript
{
  data: {
    today: {
      total: number;
      byType: Array<{ definitionId: string; name: string; count: number }>;
    };
    streak: {
      current: number;
      longest: number;
    };
    goalRate: {
      overall: number; // 0-100
      change: number;  // vs 上周，可为负
    };
    weekCompare: {
      thisWeek: number;
      lastWeek: number;
      change: number; // 百分比
    };
  }
}
```

#### GET /api/dashboard/trends

获取行为趋势数据。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | string | 否 | 'today' \| '7d' \| '30d' \| '90d' \| 'custom' |
| start | string | 否 | ISO日期，range=custom时必填 |
| end | string | 否 | ISO日期，range=custom时必填 |
| types | string | 否 | 行为类型ID，逗号分隔 |

**响应**:
```typescript
{
  data: {
    points: Array<{
      date: string;  // YYYY-MM-DD
      total: number;
      byType: Record<string, number>;
    }>;
    types: Array<{ id: string; name: string; color: string }>;
  }
}
```

#### GET /api/dashboard/heatmap

获取热力图数据。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| months | number | 否 | 月份数，默认12 |

**响应**:
```typescript
{
  data: Array<{
    date: string;  // YYYY-MM-DD
    count: number;
    level: 0 | 1 | 2 | 3 | 4; // 预计算的颜色等级
  }>
}
```

### 2.3 错误码

| 状态码 | 错误 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 400 | `INVALID_DATE_RANGE` | 无效的日期范围 |
| 500 | `INTERNAL_ERROR` | 服务器错误 |

---

## 3. 类型定义

### 3.1 服务端类型 (`types/dashboard-server.ts`)

```typescript
// 请求参数
export interface GetTrendsParams {
  range: 'today' | '7d' | '30d' | '90d' | 'custom';
  start?: string;
  end?: string;
  types?: string[];
}

export interface GetHeatmapParams {
  months?: number;
}

// 服务返回模型
export interface DashboardStatsModel {
  today: {
    total: number;
    byType: Array<{ definitionId: string; name: string; count: number }>;
  };
  streak: {
    current: number;
    longest: number;
  };
  goalRate: {
    overall: number;
    change: number;
  };
  weekCompare: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
}

export interface TrendDataModel {
  points: Array<{
    date: string;
    total: number;
    byType: Record<string, number>;
  }>;
  types: Array<{ id: string; name: string; color: string }>;
}

export interface HeatmapDataModel {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}
```

### 3.2 客户端类型 (`types/dashboard-client.ts`)

```typescript
// 时间范围
export type TimeRangePreset = 'today' | '7d' | '30d' | '90d';
export type TimeRange =
  | { type: 'preset'; value: TimeRangePreset }
  | { type: 'custom'; start: string; end: string };

// 统计数据
export interface DashboardStats {
  today: {
    total: number;
    byType: Array<{ definitionId: string; name: string; count: number }>;
  };
  streak: {
    current: number;
    longest: number;
  };
  goalRate: {
    overall: number;
    change: number;
  };
  weekCompare: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
}

// 趋势数据
export interface TrendData {
  points: Array<{
    date: string;
    total: number;
    byType: Record<string, number>;
  }>;
  types: Array<{ id: string; name: string; color: string }>;
}

// 热力图数据
export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// 目标进度 (复用 goal 类型)
export interface GoalProgress {
  id: string;
  name: string;
  progress: number;
  target: number;
  current: number;
  unit?: string;
  status: 'active' | 'completed' | 'abandoned';
}
```

---

## 4. 组件架构

### 4.1 组件层次

```
DashboardPage (page.tsx)
├── DashboardHeader
│   ├── PageTitle
│   ├── TimeRangeSelector
│   └── ActionButtons (刷新、导出)
├── StatsCardGroup
│   ├── TodayStatsCard
│   ├── StreakCard
│   ├── GoalRateCard
│   └── WeekCompareCard
├── TrendSection
│   ├── TypeFilter
│   └── TrendLineChart
├── HeatmapSection
│   ├── CalendarHeatmap
│   └── DayDetailModal
├── GoalProgressSection
│   └── GoalProgressRing[]
└── CategoryPieSection (P1)
    └── CategoryPieChart
```

### 4.2 Hooks 设计

```typescript
// hooks/use-dashboard.ts
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetchDashboardStats(),
    staleTime: 60 * 1000, // 1分钟
  });
}

export function useTrends(range: TimeRange, types?: string[]) {
  return useQuery({
    queryKey: ['dashboard', 'trends', range, types],
    queryFn: () => fetchTrends(range, types),
    staleTime: 60 * 1000,
  });
}

export function useHeatmap(months = 12) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', months],
    queryFn: () => fetchHeatmap(months),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useDayRecords(date: string) {
  return useQuery({
    queryKey: ['behaviors', 'byDate', date],
    queryFn: () => fetchBehaviorsByDate(date),
    enabled: Boolean(date),
  });
}
```

### 4.3 状态管理

使用 TanStack Query 管理服务端状态，无需 Zustand。

本地 UI 状态:
```typescript
// 组件内 useState
const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'preset', value: '7d' });
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
```

---

## 5. 任务拆分

### 5a-前置 (低风险)

| 任务 | 产出 |
|------|------|
| 定义服务端类型 | `types/dashboard-server.ts` |
| 定义客户端类型 | `types/dashboard-client.ts` |
| 编写类型测试 | `types/__tests__/dashboard.test.ts` |

### 5b-后端 (中风险)

| 任务 | 产出 |
|------|------|
| 实现 DashboardService | `lib/dashboard-service.ts` |
| 实现 stats API | `app/api/dashboard/stats/route.ts` |
| 实现 trends API | `app/api/dashboard/trends/route.ts` |
| 实现 heatmap API | `app/api/dashboard/heatmap/route.ts` |
| 编写服务测试 | `lib/__tests__/dashboard-service.test.ts` |

### 5c-前端 (中风险)

| 任务 | 产出 |
|------|------|
| 实现 useDashboard Hook | `hooks/use-dashboard.ts` |
| 实现 TimeRangeSelector | `components/dashboard/time-range-selector.tsx` |
| 实现 StatsCard 组件 | `components/dashboard/stats-card.tsx` |
| 实现 TrendLineChart | `components/dashboard/trend-line-chart.tsx` |
| 实现 CalendarHeatmap | `components/dashboard/calendar-heatmap.tsx` |
| 实现 GoalProgressRing | `components/dashboard/goal-progress-ring.tsx` |
| 实现 DayDetailModal | `components/dashboard/day-detail-modal.tsx` |
| 重构 Dashboard 页面 | `app/dashboard/page.tsx` |
| 编写组件测试 | `components/dashboard/__tests__/*.test.tsx` |

---

## 6. 测试策略

### 6.1 测试金字塔

```
        /\
       /E2E\        1-2 关键流程
      /------\
     /集成测试\      API 接口测试
    /----------\
   /  单元测试  \    Service + Utils
  /--------------\
```

### 6.2 测试用例草案

详见 `test-plan.md`

---

## 7. 图表库选型

### 7.1 候选方案

| 库 | 优点 | 缺点 |
|-----|------|------|
| **Recharts** | React原生、轻量、SSR友好 | 热力图需额外实现 |
| Nivo | 功能全面、有日历热力图 | 体积较大 |
| ECharts | 功能强大 | 非React原生、体积大 |

### 7.2 推荐方案

**Recharts** + 自定义 CalendarHeatmap

理由:
1. 与 React/Chakra 集成好
2. 支持 SSR (动态导入)
3. 体积小，按需引入
4. 热力图可用 CSS Grid 自行实现，符合设计要求

**安装**:
```bash
pnpm add recharts
```

---

## 8. 性能优化

| 优化项 | 方案 |
|--------|------|
| 首屏加载 | 卡片优先加载，图表 Suspense 延迟 |
| 图表库 | 动态导入 `next/dynamic` |
| 数据缓存 | TanStack Query staleTime |
| 大数据量 | 后端聚合，前端不处理原始数据 |
| 重渲染 | React.memo + useMemo |
