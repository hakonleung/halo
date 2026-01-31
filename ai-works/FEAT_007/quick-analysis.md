# FEAT_007 快速分析

## 需求类型

功能迭代 + UI微调

## 需求描述

添加时间轴渲染组件 Timeline View，并修改 log 页面的渲染方式：

1. **Timeline View 组件功能**：
   - 根据时间范围自动确定每个泳道的时间跨度（hour/day/month）
   - 每个泳道上方添加时间缩写
   - 点击泳道线弹 tooltip 在当前鼠标位置显示所指示时间
   - 组件接受 `{node, h, w, start, end}[]` 和 `start/end` 作为参数
   - 计算每个 item 的位置，默认从上到下渲染，但如果有重叠的位置，就渲染在更下方
   - 可左右滚动，默认滚动到最右侧

2. **Log 页面改造**：
   - 重写 goal/record/note 的卡片组件，固定宽高，细长紧凑的设计以适应时间轴的渲染
   - 每个 section 确定好时间轴的数据
   - 使用时间轴渲染数据

## 相关代码定位

### 1. Timeline View 组件

- 位置: 需要新建 `src/components/shared/timeline-view.tsx`
- 功能:
  - 接收数据项数组 `{node: ReactNode, h: number, w: number, start: Date, end: Date}[]`
  - 接收时间范围 `start: Date, end: Date`
  - 自动计算时间跨度（hour/day/month）
  - 渲染时间轴泳道
  - 处理重叠检测和位置计算
  - 支持横向滚动，默认滚动到最右侧

### 2. Goal 卡片组件

- 位置: `src/components/goals/goal-card.tsx`
- 当前状态: 使用 `Card.Root size="md"`，自适应宽高
- 需要: 改为固定宽高（细长紧凑），适合时间轴横向展示

### 3. Record 卡片组件

- 位置: `src/components/history/record-card.tsx`
- 当前状态: 使用 `Card.Root size="md"`，自适应宽高
- 需要: 改为固定宽高（细长紧凑），适合时间轴横向展示

### 4. Note 卡片组件

- 位置: `src/components/log/notes-section.tsx` (line 177-225)
- 当前状态: 使用 `Card.Root size="md"`，自适应宽高
- 需要: 抽取为独立组件，改为固定宽高（细长紧凑），适合时间轴横向展示

### 5. Log 页面 Sections

- 位置:
  - `src/components/log/goals-section.tsx`
  - `src/components/log/records-section.tsx`
  - `src/components/log/notes-section.tsx`
- 当前状态: 使用列表/网格展示
- 需要:
  - 准备时间轴数据格式
  - 使用 Timeline View 组件渲染

## 修改清单

### Timeline View 组件

1. `src/components/shared/timeline-view.tsx`: 创建时间轴组件
   - 时间跨度计算逻辑（hour/day/month）
   - 泳道渲染和时间标签
   - Tooltip 交互
   - 重叠检测和位置计算算法
   - 横向滚动和默认滚动到右侧

### 卡片组件重写

2. `src/components/goals/goal-timeline-card.tsx`: 创建时间轴专用 Goal 卡片
   - 固定宽高（如 200px x 60px）
   - 细长紧凑设计
   - 显示关键信息（名称、状态、进度）

3. `src/components/history/record-timeline-card.tsx`: 创建时间轴专用 Record 卡片
   - 固定宽高（如 200px x 60px）
   - 细长紧凑设计
   - 显示关键信息（名称、图标、时间）

4. `src/components/log/note-timeline-card.tsx`: 创建时间轴专用 Note 卡片
   - 固定宽高（如 200px x 60px）
   - 细长紧凑设计
   - 显示关键信息（标题、标签、时间）

### Log 页面改造

5. `src/components/log/goals-section.tsx`: 修改为使用 Timeline View
   - 准备时间轴数据（goal 的 startDate 和 endDate）
   - 使用 Timeline View 渲染

6. `src/components/log/records-section.tsx`: 修改为使用 Timeline View
   - 准备时间轴数据（record 的 recordedAt）
   - 使用 Timeline View 渲染

7. `src/components/log/notes-section.tsx`: 修改为使用 Timeline View
   - 准备时间轴数据（note 的 createdAt）
   - 使用 Timeline View 渲染

## 技术要点

- **时间跨度计算**: 根据时间范围自动选择合适的时间单位
  - 小于 1 天: hour
  - 小于 30 天: day
  - 大于等于 30 天: month

- **重叠检测算法**: 
  - 按时间顺序排序 items
  - 使用贪心算法分配行位置
  - 检测时间区间重叠，重叠的 item 放在下一行

- **位置计算**:
  - 根据 start/end 时间计算在时间轴上的 x 位置
  - 根据重叠检测结果计算 y 位置（行号）
  - 宽度根据时间跨度计算

- **Tooltip 交互**:
  - 监听泳道线的点击事件
  - 计算鼠标位置
  - 显示对应时间的 tooltip

- **滚动控制**:
  - 使用 `useRef` 和 `useEffect` 控制滚动位置
  - 默认滚动到最右侧（最新时间）

- **卡片设计**:
  - 固定尺寸: 宽度根据时间跨度计算，高度固定（如 60px）
  - 紧凑布局: 只显示关键信息
  - 使用 Chakra UI 组件保持主题一致性

