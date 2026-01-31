# UI_003: 修改 new goal 的渲染逻辑 - 实现记录

## 修改概览

本次修改实现了以下功能：
1. 在 create behavior 的 drawer 中增加了 Tab 功能
2. 将 new goal 功能集成到同一个 drawer 中

## 文件修改清单

### 1. 新建文件

#### `src/components/goals/goal-form.tsx`
- **功能**: Goal 创建表单组件
- **特性**:
  - 基本字段：name, description, category, startDate, endDate
  - 动态 Criteria 管理：支持添加/删除多个 criteria
  - 每个 criterion 包含：behaviorId, metric, operator, value, period, description
  - 使用 `useCreateGoal` hook 提交
  - 完整的表单验证
  - 参考 `RecordForm` 的样式和结构

#### `src/components/shared/action-drawer-context.tsx`
- **功能**: Action Drawer 的 Context，用于全局控制 drawer 状态
- **API**:
  - `isOpen`: drawer 是否打开
  - `activeTab`: 当前激活的 tab ('record' | 'goal')
  - `openDrawer(tab?)`: 打开 drawer，可选指定 tab
  - `closeDrawer()`: 关闭 drawer
  - `setActiveTab(tab)`: 切换 tab

### 2. 修改文件

#### `src/components/shared/action-button.tsx`
- **修改内容**:
  - 添加 Tab 功能（参考 Settings 页面的实现）
  - 两个 Tab：`Record` 和 `Goal`
  - Tab 1 显示 `RecordForm`
  - Tab 2 显示 `GoalForm`
  - Drawer 标题根据当前 Tab 动态变化
  - 使用 `useActionDrawer` context 控制状态
  - Drawer 宽度从 420px 调整为 500px（适应 Goal 表单）

#### `src/components/goals/index.ts`
- **修改内容**:
  - 添加 `GoalForm` 的导出

#### `src/app/layout.tsx`
- **修改内容**:
  - 添加 `ActionDrawerProvider` 包裹整个应用
  - 确保 drawer context 在所有页面可用

#### `src/app/goals/page.tsx`
- **修改内容**:
  - 移除跳转到 `/goals/new` 的逻辑
  - "Create Goal" 按钮改为调用 `openDrawer('goal')` 打开 drawer 并激活 Goal tab
  - 导入 `useActionDrawer` hook

## 技术实现细节

### Tab 实现
- 使用自定义 Tab 实现（参考 `SettingsPageContent`）
- 使用 Button 组件模拟 Tab，通过 state 控制激活状态
- Tab 样式：激活时显示矩阵绿边框和文字颜色

### Context 设计
- 使用 React Context 实现全局状态管理
- Provider 放在根 layout，确保所有页面可访问
- 提供简洁的 API：`openDrawer`, `closeDrawer`, `setActiveTab`

### GoalForm 表单设计
- 基本字段使用标准 Chakra UI 组件
- Criteria 使用可折叠的 Box 组件，每个 criterion 独立显示
- 支持动态添加/删除 criteria（至少保留一个）
- 表单验证包括：
  - 必填字段检查
  - 日期范围验证（endDate >= startDate）
  - Criteria 完整性验证

### 样式一致性
- 遵循项目 UI 设计规范（赛博朋克风格）
- Tab 样式与 Settings 页面保持一致
- 表单样式与 `RecordForm` 保持一致
- 使用 Chakra UI 组件，不自定义 class

## 测试要点

1. **功能测试**:
   - [ ] ActionButton 点击打开 drawer，默认显示 Record tab
   - [ ] Tab 切换功能正常
   - [ ] RecordForm 在 Record tab 中正常显示和工作
   - [ ] GoalForm 在 Goal tab 中正常显示和工作
   - [ ] Goals 页面的 "Create Goal" 按钮打开 drawer 并激活 Goal tab
   - [ ] 创建 goal 成功后 drawer 自动关闭
   - [ ] 创建 record 成功后 drawer 自动关闭

2. **表单验证**:
   - [ ] GoalForm 必填字段验证
   - [ ] 日期范围验证
   - [ ] Criteria 完整性验证
   - [ ] 至少需要一个有效的 criterion

3. **样式测试**:
   - [ ] Tab 样式正确显示
   - [ ] Drawer 宽度适配不同屏幕
   - [ ] 表单样式与现有组件一致

## 注意事项

- ActionButton 组件在 `AuthenticatedLayout` 中渲染，确保在需要认证的页面可用
- Context Provider 放在根 layout，确保全局可用
- GoalForm 需要 behavior definitions 数据，依赖 `useBehaviorDefinitions` hook
- 表单提交成功后会自动刷新相关数据（通过 TanStack Query 的 invalidateQueries）

