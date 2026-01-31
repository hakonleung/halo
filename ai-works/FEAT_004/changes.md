# FEAT_004: 修改 goal / record / definition 的展示页面 - 实现记录

## 修改概览

本次修改实现了以下功能：
1. URL query 参数管理，点击 goal/record/definition 时添加 query 到 URL
2. 全局 detail drawers，自动检测 query 并显示详情
3. 合并 goals 和 history 页面成 LOG 页面
4. LOG 页面作为 app 的默认页面
5. 在 action drawer 中添加 Note tab

## 文件修改清单

### 1. 新建文件

#### `src/hooks/use-url-query.ts`
- **功能**: URL query 参数管理 hook
- **API**: `getQuery`, `setQuery`, `removeQuery`, `clearAllQueries`

#### `src/components/log/detail-drawer-provider.tsx`
- **功能**: Detail drawer 的 Context，自动检测 URL query 参数
- **检测**: `goal`, `record`, `definition` query 参数

#### `src/components/log/detail-drawers.tsx`
- **功能**: 全局 detail drawers 组件，根据 query 自动显示对应的 drawer

#### `src/components/log/goal-detail-drawer.tsx`
- **功能**: Goal 详情 drawer 组件
- **特性**: 显示 goal 详情、进度、criteria，支持操作（完成、放弃、删除）

#### `src/components/log/record-detail-drawer.tsx`
- **功能**: Record 详情 drawer 组件
- **特性**: 
  - 使用 tabs 显示 record 和 definition
  - 显示 record 的 metadata 和 note
  - 显示 definition 的 schema
  - 支持删除操作

#### `src/components/log/note-form.tsx`
- **功能**: Note 创建表单组件
- **特性**: title (可选), content (必填), tags (可选，逗号分隔)

#### `src/app/log/page.tsx`
- **功能**: 新的 LOG 页面，合并 goals 和 history
- **特性**:
  - 使用 tabs 展示三个分区：Goals / Records / Notes
  - Goals tab: 显示 goals 列表和筛选
  - Records tab: 显示 records 列表（从 history 过滤）
  - Notes tab: 显示 notes 列表

### 2. 修改文件

#### `src/app/layout.tsx`
- **修改内容**:
  - 添加 `DetailDrawerProvider` 包裹应用
  - 添加 `DetailDrawers` 组件显示全局 drawers

#### `src/app/page.tsx`
- **修改内容**:
  - 默认重定向从 `/dashboard` 改为 `/log`

#### `src/components/shared/action-drawer-context.tsx`
- **修改内容**:
  - 扩展 `ActionDrawerTab` 类型，添加 `'note'`

#### `src/components/shared/action-button.tsx`
- **修改内容**:
  - 添加 "Note" tab
  - 集成 `NoteForm` 组件
  - 更新标题逻辑

#### `src/components/goals/goal-list.tsx`
- **修改内容**:
  - 移除 `onGoalClick` prop
  - 点击 goal 时直接添加 `?goal=xxx` 到 URL

#### `src/components/goals/goal-card.tsx`
- **修改内容**:
  - 点击时添加 query 参数到 URL（已在 goal-list 中实现）

#### `src/components/history/history-list.tsx`
- **修改内容**:
  - Edit 按钮点击时，根据 item.type 添加对应的 query 参数
  - `goal` → `?goal=xxx`
  - `behavior` → `?record=xxx`

#### `src/app/goals/page.tsx`
- **修改内容**:
  - 移除未使用的 `router` 导入
  - 移除 `onGoalClick` prop（已在 goal-list 中处理）

#### `src/components/layout/bottom-navbar.tsx`
- **修改内容**:
  - 更新导航项：移除 Goals 和 History，添加 Log
  - 导航项：Log, Chat, Settings

## 技术实现细节

### URL Query 管理

使用 Next.js 的 `useSearchParams` 和 `useRouter`:
- `getQuery(key)`: 获取 query 参数值
- `setQuery(key, value)`: 设置 query 参数
- `removeQuery(key)`: 移除 query 参数
- `clearAllQueries()`: 清除所有 query 参数

### Detail Drawer 自动检测

在 `DetailDrawerProvider` 中：
- 监听 URL searchParams 变化
- 自动检测 `goal`, `record`, `definition` 参数
- 返回当前 drawer 类型和 ID
- 提供 `closeDrawer` 方法清除 query

### LOG 页面结构

```
LOG Page
├── Header (标题 + 添加按钮)
├── Tabs (Goals / Records / Notes)
├── Goals Tab
│   ├── Filters (Status, Category, Search)
│   └── GoalList
├── Records Tab
│   ├── HistoryFilters
│   └── HistoryList (filtered by behavior type)
└── Notes Tab
    └── NotesList
```

### 点击行为修改

- **Goals**: 点击 goal card 时，添加 `?goal=xxx` 到 URL
- **History**: 点击 Edit 按钮时，根据类型添加 `?goal=xxx` 或 `?record=xxx`
- Drawer 自动打开并显示详情

### Note 功能

- 在 action drawer 中添加 "Note" tab
- Note 表单包含：title (可选), content (必填), tags (可选)
- 使用现有的 `useCreateNote` hook
- 创建成功后刷新 notes 列表

## 待实现功能

以下功能在需求中提到，但本次实现中暂未完成，可在后续迭代中实现：

1. **编辑模式**:
   - Goal drawer 的编辑模式
   - Record drawer 的编辑模式
   - Definition 的编辑模式

2. **Definition Detail Drawer**:
   - 独立的 definition detail drawer（当前在 record drawer 中显示）

3. **Note Detail Drawer**:
   - Note 的详情 drawer（当前只在列表中显示）

## 测试要点

1. **URL Query 功能**:
   - [ ] 点击 goal 时，URL 添加 `?goal=xxx`
   - [ ] 点击 record 的 Edit 时，URL 添加 `?record=xxx`
   - [ ] 关闭 drawer 时，query 参数被清除

2. **Detail Drawers**:
   - [ ] Goal drawer 正确显示 goal 详情
   - [ ] Record drawer 正确显示 record 和 definition
   - [ ] Drawer 根据 URL query 自动打开

3. **LOG 页面**:
   - [ ] 三个 tabs 正常切换
   - [ ] Goals tab 显示 goals 列表
   - [ ] Records tab 显示 records 列表
   - [ ] Notes tab 显示 notes 列表

4. **Note 功能**:
   - [ ] Action drawer 中显示 Note tab
   - [ ] Note 表单可以正常提交
   - [ ] 创建的 note 出现在 Notes tab 中

5. **导航**:
   - [ ] 默认页面重定向到 `/log`
   - [ ] Bottom navbar 显示正确的导航项

## 注意事项

- URL query 和 drawer 状态保持同步
- 关闭 drawer 时清除对应的 query 参数
- Record drawer 从 behavior records 列表中查找，可能需要优化（当前获取 100 条记录）
- 编辑模式功能待后续实现
- LOG 页面合并了 goals 和 history 的功能，保持原有筛选和分页功能

