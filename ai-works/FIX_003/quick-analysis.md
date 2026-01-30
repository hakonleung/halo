# 快速分析 - FIX_003

## 需求描述

修复 Dashboard 相关的多个问题：
1. dashboardService 应该使用用户时区，只需要返回区间所有的记录，由前端控制划分逻辑
2. Activity Heatmap 的样式有问题，顶部应该显示月份的英文缩写，左侧应该显示周几
3. 所有使用 backdropFilter 的地方都应该设置透明背景
4. 所有带边框的块都应该使用 Card，Card 也要使用 backdropFilter 和透明背景

## 问题分析

### 1. dashboardService 使用用户时区

**问题**: 当前 `dashboardService` 在服务端使用服务器时区进行日期计算和分组，但应该返回原始记录数据，由前端根据用户时区进行划分。

**位置**: 
- `src/lib/dashboard-service.ts` - `getTrends` 和 `getHeatmap` 方法
- `src/app/api/dashboard/trends/route.ts` - API 路由
- `src/app/api/dashboard/heatmap/route.ts` - API 路由

**当前逻辑**:
- `getTrends`: 在服务端按日期字符串分组，返回 `{ date, total, byType }` 格式
- `getHeatmap`: 在服务端生成所有日期并计算 count，返回 `{ date, count, level }` 格式

**修复方案**:
- `getTrends`: 只返回原始记录列表，包含 `recorded_at` 和 `definition_id`，前端根据用户时区进行分组
- `getHeatmap`: 只返回原始记录列表，包含 `recorded_at`，前端根据用户时区计算日期和 count
- 需要从用户设置中获取时区信息，传递给前端

**需要修改**:
1. 修改 `dashboard-service.ts` 的 `getTrends` 和 `getHeatmap` 方法，返回原始记录
2. 修改 API 路由，获取用户时区并返回给前端
3. 修改前端 hooks，根据用户时区处理数据
4. 修改前端组件，使用处理后的数据

### 2. Activity Heatmap 样式问题

**问题**: 
- 顶部应该显示月份的英文缩写（如 Jan, Feb, Mar）
- 左侧应该显示周几（目前只显示部分，且显示逻辑有问题：`display={i % 2 === 1 ? 'block' : 'none'}` 只显示奇数索引）

**位置**: `src/components/dashboard/calendar-heatmap.tsx`

**修复方案**:
- 添加月份标签显示在顶部，每个月的第一周显示月份缩写
- 修复左侧周几标签的显示逻辑，显示所有周几（SUN, MON, TUE, WED, THU, FRI, SAT）

### 3. backdropFilter 透明背景

**问题**: 所有使用 `backdropFilter` 的地方都应该有透明背景（`background: rgba(...)`）。

**位置**: 
- `src/styles/tokens/glassmorphism.ts` - `glassStyles` 只有 backdropFilter，没有背景色
- `src/styles/components/select.ts` - 已有透明背景 ✓
- `src/styles/components/popover.ts` - 已有透明背景 ✓
- `src/styles/components/drawer.ts` - 已有透明背景 ✓
- `src/styles/components/card.ts` - 已有透明背景 ✓
- `src/styles/components/bottom-nav.ts` - 已有透明背景 ✓

**修复方案**: 
- `glassStyles` 主要用于工具函数，不需要背景色（背景色应该在具体组件中设置）
- 检查所有直接使用 `backdropFilter` 的组件，确保都有透明背景

### 4. 使用 Card 组件

**问题**: 所有带边框的块都应该使用 Card 组件，保持一致的样式。

**位置**: 
- `src/components/dashboard/trend-line-chart.tsx` - 使用 Box 带边框
- `src/components/dashboard/calendar-heatmap.tsx` - 使用 Box 带边框
- `src/components/dashboard/stats-card.tsx` - 使用 Box 带边框

**修复方案**: 
- 将这些 Box 替换为 Card 组件
- Card 组件已经配置了 backdropFilter 和透明背景

## 修改清单

### 1. dashboardService 使用用户时区
- [ ] `src/lib/dashboard-service.ts` - 修改 `getTrends` 返回原始记录列表
- [ ] `src/lib/dashboard-service.ts` - 修改 `getHeatmap` 返回原始记录列表
- [ ] `src/types/dashboard-server.ts` - 更新类型定义
- [ ] `src/app/api/dashboard/trends/route.ts` - 获取用户时区并返回
- [ ] `src/app/api/dashboard/heatmap/route.ts` - 获取用户时区并返回
- [ ] `src/lib/internal-api/dashboard.ts` - 更新 API 调用和类型转换
- [ ] `src/hooks/use-dashboard.ts` - 根据用户时区处理数据
- [ ] `src/types/dashboard-client.ts` - 更新类型定义

### 2. 修复 Heatmap 样式
- [ ] `src/components/dashboard/calendar-heatmap.tsx` - 添加月份标签，修复周几标签显示

### 3. 修复 backdropFilter 透明背景
- [ ] 检查所有直接使用 `backdropFilter` 的地方，确保都有透明背景

### 4. 使用 Card 组件
- [ ] `src/components/dashboard/trend-line-chart.tsx` - 将 Box 替换为 Card
- [ ] `src/components/dashboard/calendar-heatmap.tsx` - 将 Box 替换为 Card
- [ ] `src/components/dashboard/stats-card.tsx` - 将 Box 替换为 Card

## 预期结果

1. dashboardService 返回原始记录，前端根据用户时区进行数据划分
2. Activity Heatmap 顶部显示月份缩写，左侧正确显示所有周几
3. 所有使用 backdropFilter 的组件都有透明背景
4. 所有带边框的块都使用 Card 组件，保持一致的样式

