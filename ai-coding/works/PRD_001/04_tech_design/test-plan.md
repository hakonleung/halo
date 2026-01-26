# 测试计划

> PRD_001 | 可视化模块

## 测试策略

### 测试金字塔

```
           /\
          /  \       E2E: 1-2 关键流程
         /----\
        /      \     集成: API 端点测试
       /--------\
      /          \   单元: Service + Utils + Types
     /--------------\
```

### 覆盖目标

| 层级 | 目标覆盖率 | 重点 |
|------|-----------|------|
| 单元测试 | 80% | Service 核心逻辑 |
| 集成测试 | 100% API | 所有端点 |
| E2E | 关键路径 | 首屏加载、时间切换 |

---

## 单元测试

### 1. DashboardService

**文件**: `lib/__tests__/dashboard-service.test.ts`

```typescript
describe('DashboardService', () => {
  describe('getStats', () => {
    it('should return today stats with correct count');
    it('should return zero when no records today');
    it('should calculate streak correctly for consecutive days');
    it('should reset streak when day is skipped');
    it('should calculate goal rate as average of all goals');
    it('should calculate week compare change percentage');
  });

  describe('getTrends', () => {
    it('should return points for each day in range');
    it('should filter by behavior types when specified');
    it('should aggregate by week for 90d range');
    it('should handle custom date range');
    it('should return empty array when no data');
  });

  describe('getHeatmap', () => {
    it('should return 365 days for 12 months');
    it('should calculate level correctly based on count');
    it('should fill missing days with count 0');
  });
});
```

### 2. 类型验证

**文件**: `types/__tests__/dashboard.test.ts`

```typescript
describe('Dashboard Types', () => {
  describe('TimeRange', () => {
    it('should accept preset values');
    it('should accept custom range with valid dates');
    it('should reject invalid preset');
  });

  describe('DashboardStats', () => {
    it('should match expected structure');
  });
});
```

### 3. 工具函数

**文件**: `utils/__tests__/dashboard-utils.test.ts`

```typescript
describe('Dashboard Utils', () => {
  describe('calculateStreak', () => {
    it('should return 0 for empty records');
    it('should return 1 for single day');
    it('should count consecutive days');
    it('should stop at gap');
  });

  describe('calculateLevel', () => {
    it('should return 0 for count 0');
    it('should return 1 for count 1-2');
    it('should return 4 for count >= 10');
  });

  describe('aggregateByDate', () => {
    it('should group records by date');
    it('should sum counts for same date');
  });
});
```

---

## 集成测试

### API 端点测试

**文件**: `app/api/dashboard/__tests__/routes.test.ts`

```typescript
describe('Dashboard API', () => {
  describe('GET /api/dashboard/stats', () => {
    it('should return 401 when not authenticated');
    it('should return stats for authenticated user');
    it('should not return other users data');
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return 401 when not authenticated');
    it('should default to 7d range');
    it('should accept valid range parameter');
    it('should return 400 for invalid range');
    it('should filter by types parameter');
    it('should validate custom date range');
  });

  describe('GET /api/dashboard/heatmap', () => {
    it('should return 401 when not authenticated');
    it('should return 12 months by default');
    it('should accept months parameter');
  });
});
```

---

## 组件测试

### 1. StatsCard

**文件**: `components/dashboard/__tests__/stats-card.test.tsx`

```typescript
describe('StatsCard', () => {
  it('should render title and value');
  it('should show loading skeleton');
  it('should show trend indicator up');
  it('should show trend indicator down');
  it('should handle click');
});
```

### 2. TrendLineChart

**文件**: `components/dashboard/__tests__/trend-line-chart.test.tsx`

```typescript
describe('TrendLineChart', () => {
  it('should render with data');
  it('should show loading state');
  it('should show empty state');
  it('should filter by type on click');
  it('should show tooltip on hover');
});
```

### 3. CalendarHeatmap

**文件**: `components/dashboard/__tests__/calendar-heatmap.test.tsx`

```typescript
describe('CalendarHeatmap', () => {
  it('should render 365 cells');
  it('should apply correct level colors');
  it('should show tooltip on hover');
  it('should call onDayClick');
});
```

### 4. GoalProgressRing

**文件**: `components/dashboard/__tests__/goal-progress-ring.test.tsx`

```typescript
describe('GoalProgressRing', () => {
  it('should render progress percentage');
  it('should apply color based on progress');
  it('should show complete state at 100%');
  it('should expand on click');
});
```

---

## E2E 测试

**文件**: `e2e/dashboard.spec.ts`

```typescript
describe('Dashboard Page', () => {
  beforeEach(() => {
    // 登录
  });

  it('should load dashboard with stats cards', async () => {
    // 验证4个卡片加载
  });

  it('should switch time range and update charts', async () => {
    // 点击时间选择器
    // 选择30天
    // 验证图表更新
  });

  it('should show day detail modal on heatmap click', async () => {
    // 点击热力图格子
    // 验证弹窗显示
    // 验证行为列表
  });

  it('should expand goal progress on click', async () => {
    // 点击目标进度环
    // 验证展开关联行为
  });
});
```

---

## 测试数据

### Mock 数据

```typescript
export const mockStats: DashboardStats = {
  today: {
    total: 12,
    byType: [
      { definitionId: 'def-1', name: '阅读', count: 5 },
      { definitionId: 'def-2', name: '运动', count: 7 },
    ],
  },
  streak: { current: 7, longest: 21 },
  goalRate: { overall: 68, change: 5 },
  weekCompare: { thisWeek: 42, lastWeek: 36, change: 16.67 },
};

export const mockTrends: TrendData = {
  points: [
    { date: '2026-01-19', total: 8, byType: { 'def-1': 3, 'def-2': 5 } },
    { date: '2026-01-20', total: 6, byType: { 'def-1': 2, 'def-2': 4 } },
  ],
  types: [
    { id: 'def-1', name: '阅读', color: '#00FF41' },
    { id: 'def-2', name: '运动', color: '#00D4FF' },
  ],
};

export const mockHeatmap: HeatmapData[] = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 15),
  level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
}));
```

---

## 运行测试

```bash
# 单元测试
pnpm test

# 覆盖率报告
pnpm test --coverage

# E2E 测试
pnpm test:e2e

# 指定文件
pnpm test dashboard-service
```
