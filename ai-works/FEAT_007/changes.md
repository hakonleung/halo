# FEAT_007 修改记录

## 概述

添加时间轴渲染组件 Timeline View，并修改 log 页面的渲染方式，使用时间轴展示 goals、records 和 notes。

## 新增文件

### 1. Timeline View 组件

**文件**: `src/components/shared/timeline-view.tsx`

- 时间轴渲染组件
- 根据时间范围自动确定时间跨度（hour/day/month）
- 泳道渲染和时间标签
- 重叠检测和位置计算算法
- Tooltip 交互（点击泳道线显示时间）
- 横向滚动，默认滚动到最右侧

### 2. 时间轴专用卡片组件

**文件**: `src/components/goals/goal-timeline-card.tsx`
- Goal 时间轴卡片，固定宽高（200px x 60px）
- 细长紧凑设计，显示关键信息

**文件**: `src/components/history/record-timeline-card.tsx`
- Record 时间轴卡片，固定宽高（150px x 60px）
- 细长紧凑设计，显示关键信息

**文件**: `src/components/log/note-timeline-card.tsx`
- Note 时间轴卡片，固定宽高（150px x 60px）
- 细长紧凑设计，显示关键信息

## 修改文件

### 1. Goals Section

**文件**: `src/components/log/goals-section.tsx`

- 添加 `timeRange` prop
- 导入 `TimelineView` 和 `GoalTimelineCard`
- 准备时间轴数据（goal 的 startDate 和 endDate）
- 替换 `GoalList` 为 `TimelineView`
- 计算时间范围并过滤 goals

### 2. Records Section

**文件**: `src/components/log/records-section.tsx`

- 导入 `TimelineView` 和 `RecordTimelineCard`
- 准备时间轴数据（record 的 recordedAt）
- 替换 `RecordList` 为 `TimelineView`
- 计算时间范围并过滤 records

### 3. Notes Section

**文件**: `src/components/log/notes-section.tsx`

- 导入 `TimelineView` 和 `NoteTimelineCard`
- 准备时间轴数据（note 的 createdAt）
- 替换列表渲染为 `TimelineView`
- 计算时间范围并过滤 notes
- 移除未使用的 `Note` 类型导入

### 4. Log Page

**文件**: `src/app/log/page.tsx`

- 传递 `timeRange` prop 给 `GoalsSection`

## 技术实现细节

### 时间跨度计算

- 小于 1 天: 使用 `hour` 单位
- 小于 30 天: 使用 `day` 单位
- 大于等于 30 天: 使用 `month` 单位

### 重叠检测算法

- 按时间顺序排序 items
- 使用贪心算法分配行位置
- 检测时间区间重叠，重叠的 item 放在下一行

### 位置计算

- 根据 start/end 时间计算在时间轴上的 x 位置
- 根据重叠检测结果计算 y 位置（行号）
- 宽度根据时间跨度计算，最小宽度可配置

### Tooltip 交互

- 监听泳道线的点击事件
- 计算鼠标位置
- 显示对应时间的 tooltip（3 秒后自动隐藏）

### 滚动控制

- 使用 `useRef` 和 `useEffect` 控制滚动位置
- 默认滚动到最右侧（最新时间）

## 卡片设计

- **固定尺寸**: 宽度根据时间跨度计算，高度固定（60px）
- **紧凑布局**: 只显示关键信息
- **主题一致性**: 使用 Chakra UI 组件保持主题一致性
- **交互**: 点击卡片打开详情抽屉

## 验证

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过
- ✅ 所有组件正确导入和使用

