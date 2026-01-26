# 阶段 04 摘要 - 技术设计

> PRD_001 | 可视化模块

## 核心结论

可视化模块 **不新增数据库表**，基于现有 `behavior_records` 和 `goals` 表进行聚合查询。新增 3 个 API 端点和 1 个服务类，前端使用 TanStack Query 管理状态。

## 关键产出

### 新增 API

| 端点 | 说明 |
|------|------|
| `GET /api/dashboard/stats` | 概览统计 (今日、连续天数、目标率、周对比) |
| `GET /api/dashboard/trends` | 趋势数据 (支持时间范围和类型筛选) |
| `GET /api/dashboard/heatmap` | 热力图数据 (12个月) |

### 新增文件

| 文件 | 路径 |
|------|------|
| 服务端类型 | `types/dashboard-server.ts` |
| 客户端类型 | `types/dashboard-client.ts` |
| Dashboard 服务 | `lib/dashboard-service.ts` |
| Dashboard Hook | `hooks/use-dashboard.ts` |
| 组件 (8个) | `components/dashboard/*.tsx` |

### 技术选型

| 项目 | 选择 |
|------|------|
| 图表库 | Recharts (轻量、SSR友好) |
| 热力图 | 自定义 CSS Grid 实现 |
| 状态管理 | TanStack Query (无需 Zustand) |

## 供后续阶段使用

### 05a 任务
1. 定义 `types/dashboard-server.ts`
2. 定义 `types/dashboard-client.ts`
3. 编写类型测试

### 05b 任务
1. 实现 `lib/dashboard-service.ts`
2. 实现 3 个 API 端点
3. 编写服务测试

### 05c 任务
1. 实现 `hooks/use-dashboard.ts`
2. 实现 8 个 Dashboard 组件
3. 重构 Dashboard 页面
4. 安装 recharts

## 注意事项

1. **性能** - 图表使用 `next/dynamic` 动态导入
2. **缓存** - staleTime 设置为 60s (stats/trends) 和 5min (heatmap)
3. **聚合** - 90天范围需按周聚合，避免数据点过多
4. **空状态** - 每个组件需独立处理

## 关键词索引

| 关键词 | 位置 |
|--------|------|
| DashboardService | tech-design.md#4, architecture.md |
| /api/dashboard/* | api-spec.md |
| useDashboard | tech-design.md#4.2 |
| Recharts | tech-design.md#7 |
| 测试用例 | test-plan.md |
