# UI_003: 修改 new goal 的渲染逻辑

## 需求理解

1. **create behavior 的 drawer 增加 tab**：将现有的行为记录创建 drawer 改为带 Tab 的界面
2. **new goal 也在这个 drawer 里**：将创建 goal 的功能也集成到同一个 drawer 中，通过 Tab 切换

### 当前状态

- `ActionButton` 组件打开一个 Drawer，显示 `RecordForm`（用于创建 behavior record）
- Goals 页面有一个按钮跳转到 `/goals/new` 来创建新 goal（但该页面不存在）
- 没有现成的 `GoalForm` 组件

### 目标状态

- `ActionButton` 打开的 Drawer 包含两个 Tab：
  - Tab 1: "Record" - 显示 `RecordForm`（创建 behavior record）
  - Tab 2: "Goal" - 显示 `GoalForm`（创建 goal）
- 移除或修改 Goals 页面的 "Create Goal" 按钮，改为打开同一个 drawer

## 相关代码定位

### 核心文件

1. **`src/components/shared/action-button.tsx`**
   - 当前：打开 Drawer，显示 `RecordForm`
   - 需要：添加 Tab 功能，集成 `GoalForm`

2. **`src/components/behaviors/record-form.tsx`**
   - 当前：行为记录创建表单
   - 需要：保持不变，作为 Tab 1 的内容

3. **`src/app/goals/page.tsx`**
   - 当前：有 "Create Goal" 按钮，跳转到 `/goals/new`
   - 需要：改为打开 `ActionButton` 的 drawer（可能需要通过 context 或 prop 控制）

4. **需要创建：`src/components/goals/goal-form.tsx`**
   - 新建：Goal 创建表单组件
   - 功能：包含 name, description, category, startDate, endDate, criteria 等字段

### 相关类型和 Hooks

- `src/types/goal-client.ts` - Goal 相关类型定义
- `src/hooks/use-goals.ts` - `useCreateGoal` hook
- `src/hooks/use-behavior-definitions.ts` - 获取 behavior definitions（用于 goal criteria）

## 修改清单

### 1. 创建 GoalForm 组件

**文件**: `src/components/goals/goal-form.tsx`

**功能**:
- 表单字段：name (required), description (optional), category (required), startDate (required), endDate (optional)
- Criteria 管理：支持添加/删除多个 criteria
- 每个 criterion 包含：behaviorId (select), metric, operator, value, period, description
- 使用 `useCreateGoal` hook 提交
- 表单验证

**参考**:
- `RecordForm` 的表单结构和样式
- `GoalCreateRequest` 类型定义
- Behavior definitions 用于 criteria 的 behaviorId 选择

### 2. 修改 ActionButton 组件

**文件**: `src/components/shared/action-button.tsx`

**修改**:
- 添加 Tab 功能（参考 `SettingsPageContent` 的自定义 Tab 实现，或使用 Chakra UI 的 Tabs 组件）
- 两个 Tab：`Record` 和 `Goal`
- Tab 1 显示 `RecordForm`
- Tab 2 显示 `GoalForm`
- 支持通过 prop 或 context 控制初始激活的 Tab
- Drawer 标题根据当前 Tab 动态变化

### 3. 修改 Goals 页面

**文件**: `src/app/goals/page.tsx`

**修改**:
- 移除或修改 "Create Goal" 按钮
- 改为打开 `ActionButton` 的 drawer，并激活 Goal Tab
- 可能需要通过 context 或全局状态来控制 drawer 的打开和 Tab 切换

### 4. 导出 GoalForm 组件

**文件**: `src/components/goals/index.ts`

**修改**:
- 添加 `GoalForm` 的导出

## 技术要点

### Tab 实现方案

**方案 1**: 使用 Chakra UI 的 Tabs 组件（推荐）
```tsx
import { Tabs } from '@chakra-ui/react';

<Tabs.Root defaultValue="record">
  <Tabs.List>
    <Tabs.Trigger value="record">Record</Tabs.Trigger>
    <Tabs.Trigger value="goal">Goal</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="record"><RecordForm /></Tabs.Content>
  <Tabs.Content value="goal"><GoalForm /></Tabs.Content>
</Tabs.Root>
```

**方案 2**: 自定义 Tab（参考 SettingsPageContent）
- 使用 Button 模拟 Tab
- 使用 state 控制激活状态
- 更灵活，但需要更多代码

### Drawer 控制方案

**方案 1**: 使用 Context
- 创建 `ActionDrawerContext`
- 提供 `openDrawer(tab?: 'record' | 'goal')` 方法
- `ActionButton` 和 Goals 页面都使用该 context

**方案 2**: 使用 Zustand Store
- 在 `src/store/` 创建 drawer store
- 全局控制 drawer 状态和激活的 tab

**方案 3**: 通过 prop 传递（简单但不够灵活）
- `ActionButton` 接受 `initialTab` prop
- Goals 页面需要直接操作 `ActionButton`（可能需要 ref）

**推荐**: 方案 1（Context），更符合 React 最佳实践

### GoalForm 表单字段

根据 `GoalCreateRequest` 类型：
- `name`: string (required) - 文本输入
- `description`: string (optional) - 文本域
- `category`: string (required) - 选择框（health, finance, habit, learning, other）
- `startDate`: string (required) - 日期选择
- `endDate`: string (optional) - 日期选择
- `criteria`: GoalCriteria[] (required, 至少一个) - 动态列表
  - `behaviorId`: string - 从 behavior definitions 选择
  - `metric`: GoalMetric (count, sum, avg)
  - `operator`: GoalOperator (>, >=, <, <=, ==)
  - `value`: number
  - `period`: GoalPeriod (daily, weekly, monthly)
  - `description`: string

### 样式要求

- 遵循项目 UI 设计规范（赛博朋克风格）
- Tab 样式参考 Settings 页面的 Tab 实现
- 表单样式参考 `RecordForm`
- 使用 Chakra UI 组件，不自定义 class

## 实现顺序

1. 创建 `GoalForm` 组件（独立开发，可单独测试）
2. 修改 `ActionButton` 添加 Tab 功能
3. 集成 `GoalForm` 到 `ActionButton` 的 drawer
4. 修改 Goals 页面，连接 drawer 控制
5. 测试和验证

## 注意事项

- GoalForm 需要获取 behavior definitions 用于 criteria 的 behaviorId 选择
- Criteria 的添加/删除需要良好的 UX（参考 RecordForm 的 metadata schema editor）
- 表单验证要完善（required 字段、日期范围、criteria 数量等）
- 成功创建后要关闭 drawer 并刷新相关数据
- 保持与现有 `RecordForm` 的样式一致性

