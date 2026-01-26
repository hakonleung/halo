# 阶段 03 UI设计 - 摘要

## 核心结论

基于 PRD 和 UI 配置，完成了目标管理模块的 UI 设计，包括 2 个页面布局、5 个新组件规格，以及完整的 HTML 预览。

## 关键产出

1. **UI 设计文档** (`ui-design.md`)
   - 设计变量（颜色、字体、间距）
   - 组件复用分析
   - 页面设计（/goals, /goals/[id]）
   - 组件规格
   - 交互流程
   - 响应式设计

2. **页面布局文档**
   - `layouts/goals.md` - 目标列表页面
   - `layouts/goal-detail.md` - 目标详情页面

3. **组件规格文档**
   - `components/goal-card.md` - 目标卡片
   - `components/goal-form.md` - 目标表单
   - `components/goal-progress-ring.md` - 进度环（增强）

4. **HTML 预览** (`preview/index.html`)
   - 静态 HTML 展示目标列表页面效果

## 供后续阶段使用

### 页面清单
- `/goals` - 目标列表页面（US-002, US-009）
- `/goals/[id]` - 目标详情页面（US-003, US-004, US-005, US-007, US-008）

### 新组件清单
1. **GoalCard** - 目标卡片组件
2. **GoalForm** - 目标表单组件
3. **GoalCriteriaForm** - 达成条件表单组件
4. **GoalStatusBadge** - 目标状态徽章组件
5. **GoalProgressChart** - 目标进度趋势图组件

### 复用组件
- Chakra UI 基础组件（Button, Input, Select, Textarea, Field）
- 现有 `GoalProgressRing`（需增强）

### 设计变量
- 主强调色: `brand.matrix` (#00FF41)
- 背景色: `bg.void` (#0A0A0A), `bg.carbon` (#1A1A1A)
- 文字色: `text.neon` (#E0E0E0), `text.mist` (#888888)
- 边框色: `border.subtle` (rgba(0, 255, 65, 0.3))

## 注意事项

1. **响应式设计**: Mobile (< 640px) 单列，Desktop (> 1024px) 多列网格
2. **状态变体**: active/completed/abandoned 三种状态的不同样式
3. **交互反馈**: 悬停效果、加载状态、错误提示
4. **表单验证**: 实时验证和错误提示

## 关键词索引

| 关键词 | 原文位置 |
|--------|---------|
| /goals | layouts/goals.md |
| /goals/[id] | layouts/goal-detail.md |
| GoalCard | components/goal-card.md |
| GoalForm | components/goal-form.md |
| GoalProgressRing | components/goal-progress-ring.md |
| 设计变量 | ui-design.md 第1节 |
| 交互流程 | ui-design.md 第5节 |

