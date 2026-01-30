# 快速分析 - FIX_002

## 需求描述

修复 Dashboard 相关的多个问题：
1. save behavior 后要刷新 trend 等其他 queries
2. Behavior Trend 没有包含当天的信息
3. Activity Heatmap 没有包含当天的信息
4. Activity Heatmap 的样式有问题，顶部应该显示月份的英文缩写，左侧应该显示周几
5. 所有使用 backdropFilter 的地方都应该设置透明背景
6. 所有带边框的块都应该使用 Card，Card 也要使用 backdropFilter 和透明背景

## 问题分析

### 1. save behavior 后刷新 queries

**问题**: 在 `useCreateBehaviorRecord` 中，只 invalidate 了 `behavior-records` 和 `behavior-definitions`，但没有刷新 dashboard 相关的 queries（trends, heatmap, stats）。

**位置**: `src/hooks/use-behavior-records.ts:34-64`

**修复**: 在 `onSuccess` 中添加对 dashboard queries 的 invalidate：
- `['dashboard', 'stats']`
- `['dashboard', 'trends']`
- `['dashboard', 'heatmap']`

### 2. Behavior Trend 没有包含当天信息

**问题**: 在 `dashboard-service.ts` 的 `getTrends` 函数中，`getDateRange` 函数返回的 `end` 是 `now`（当前时间），但在填充日期时，循环条件是 `currentDate <= end`，如果 `end` 是今天的时间点而不是今天的结束时间，可能会导致当天数据不完整。

**位置**: `src/lib/dashboard-service.ts:225-312`

**分析**: 
- `getDateRange` 函数在 `today` 情况下返回 `{ start: today, end: now }`，这是正确的
- 但在填充日期时，使用 `currentDate <= end` 来循环，如果 `end` 是今天某个时间点，循环会包含今天
- 问题可能在于日期字符串比较：`dateStr = currentDate.toISOString().split('T')[0]` 会得到今天的日期字符串
- 查询时使用 `.lte('recorded_at', end.toISOString())` 应该能包含当天的记录

**需要检查**: 确认查询逻辑是否正确，可能需要确保 `end` 是当天的结束时间（23:59:59）而不是当前时间。

### 3. Activity Heatmap 没有包含当天信息

**问题**: 在 `dashboard-service.ts` 的 `getHeatmap` 函数中，循环条件是 `currentDate <= now`，应该能包含当天。但需要确认 `now` 是当前时间还是今天的开始时间。

**位置**: `src/lib/dashboard-service.ts:317-362`

**分析**:
- 循环使用 `while (currentDate <= now)`，如果 `now` 是当前时间，应该能包含今天
- 但需要确认日期字符串生成是否正确

### 4. Activity Heatmap 样式问题

**问题**: 
- 顶部应该显示月份的英文缩写（如 Jan, Feb）
- 左侧应该显示周几（目前只显示部分，且显示逻辑有问题）

**位置**: `src/components/dashboard/calendar-heatmap.tsx`

**修复**:
- 添加月份标签显示在顶部
- 修复左侧周几标签的显示逻辑（目前 `display={i % 2 === 1 ? 'block' : 'none'}` 只显示奇数索引）

### 5. backdropFilter 透明背景

**问题**: 所有使用 `backdropFilter` 的地方都应该有透明背景（`background: rgba(...)`）。

**位置**: 
- `src/styles/tokens/glassmorphism.ts`
- `src/styles/components/select.ts`
- `src/styles/components/popover.ts`
- `src/styles/components/drawer.ts`
- `src/styles/components/card.ts` (已有透明背景)
- `src/styles/components/bottom-nav.ts`

**修复**: 检查所有使用 `backdropFilter` 的地方，确保都有透明背景。

### 6. 使用 Card 组件

**问题**: 所有带边框的块都应该使用 Card 组件。

**位置**: 
- `src/components/dashboard/trend-line-chart.tsx` - 使用 Box 带边框
- `src/components/dashboard/calendar-heatmap.tsx` - 使用 Box 带边框
- `src/components/dashboard/stats-card.tsx` - 需要检查是否使用 Card

**修复**: 将这些 Box 替换为 Card 组件。

## 修改清单

### 1. 修复 queries 刷新
- [ ] `src/hooks/use-behavior-records.ts` - 在 `useCreateBehaviorRecord` 的 `onSuccess` 中添加 dashboard queries 的 invalidate

### 2. 修复日期范围包含当天
- [ ] `src/lib/dashboard-service.ts` - 检查并修复 `getTrends` 和 `getHeatmap` 的日期范围逻辑，确保包含当天

### 3. 修复 Heatmap 样式
- [ ] `src/components/dashboard/calendar-heatmap.tsx` - 添加月份标签，修复周几标签显示

### 4. 修复 backdropFilter 透明背景
- [ ] `src/styles/tokens/glassmorphism.ts` - 检查透明背景
- [ ] `src/styles/components/select.ts` - 检查透明背景
- [ ] `src/styles/components/popover.ts` - 检查透明背景
- [ ] `src/styles/components/drawer.ts` - 检查透明背景
- [ ] `src/styles/components/bottom-nav.ts` - 检查透明背景

### 5. 使用 Card 组件
- [ ] `src/components/dashboard/trend-line-chart.tsx` - 将 Box 替换为 Card
- [ ] `src/components/dashboard/calendar-heatmap.tsx` - 将 Box 替换为 Card
- [ ] `src/components/dashboard/stats-card.tsx` - 检查是否使用 Card

## 预期结果

1. 保存 behavior 后，dashboard 的 stats、trends、heatmap 自动刷新
2. Behavior Trend 和 Activity Heatmap 都包含当天的数据
3. Activity Heatmap 顶部显示月份缩写，左侧正确显示所有周几
4. 所有使用 backdropFilter 的组件都有透明背景
5. 所有带边框的块都使用 Card 组件，保持一致的样式

