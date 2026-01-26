# REF_001 重构计划

## 重构目标

1. 将字符串字面量联合类型改为 enum
2. 将 UI 中的中文文本改为英文

## 分析结果

### 1. 联合类型需要改为 enum

#### 类型文件中的联合类型

1. **src/types/history-server.ts**
   - `HistoryItemType = 'behavior' | 'goal' | 'note'`
   - `HistoryListRequest.goalStatus = 'active' | 'completed' | 'abandoned'`
   - `HistoryListRequest.sortBy = 'time' | 'type'`
   - `HistoryListRequest.sortOrder = 'asc' | 'desc'`

2. **src/types/chat-server.ts**
   - `ChatRole = 'user' | 'assistant' | 'system'`
   - `ChatAttachment.type = 'image' | 'audio'`

3. **src/types/behavior-server.ts**
   - `BehaviorCategory = 'health' | 'expense' | 'income' | 'habit' | 'other'`

4. **src/types/goal-client.ts**
   - `GoalCriteria.metric = 'count' | 'sum' | 'avg'`
   - `GoalCriteria.operator = '>' | '>=' | '<' | '<=' | '=='`
   - `GoalCriteria.period = 'daily' | 'weekly' | 'monthly'`
   - `Goal.status = 'active' | 'completed' | 'abandoned'`

5. **src/types/goal-server.ts**
   - `GoalCriteria.metric = 'count' | 'sum' | 'avg'`
   - `GoalCriteria.operator = '>' | '>=' | '<' | '<=' | '=='`
   - `GoalCriteria.period = 'daily' | 'weekly' | 'monthly'`

6. **src/types/dashboard-client.ts**
   - `TimeRangePreset = 'today' | '7d' | '30d' | '90d'`
   - `ExportFormat = 'png' | 'csv'`
   - `GoalProgress.status = 'active' | 'completed' | 'abandoned'`
   - `StatsCardData.trend.direction = 'up' | 'down' | 'neutral'`

#### 组件文件中的联合类型

7. **src/components/auth/auth-form.tsx**
   - `AuthMode = 'login' | 'signup'`

8. **src/utils/auth-pure.ts**
   - `PasswordStrength = 'weak' | 'medium' | 'strong'`

9. **src/components/settings/settings-page-content.tsx**
   - `SettingsTab = 'profile' | 'appearance' | 'notifications' | 'locale'`

### 2. UI 中文文本需要改为英文

#### 组件文件中的中文

1. **src/components/goals/goal-status-badge.tsx**
   - '进行中' → 'Active'
   - '已完成' → 'Completed'
   - '已放弃' → 'Abandoned'

2. **src/components/goals/goal-list.tsx**
   - '暂无目标' → 'No Goals'
   - '创建你的第一个目标' → 'Create Your First Goal'

3. **src/components/goals/goal-card.tsx**
   - '分类:' → 'Category:'
   - '开始:' → 'Start:'
   - '剩余:' → 'Remaining:'
   - '天' → 'days'
   - `toLocaleDateString('zh-CN')` → `toLocaleDateString('en-US')`

4. **src/components/dashboard/trend-line-chart.tsx**
   - '暂无趋势数据' → 'No Trend Data'
   - '行为趋势' → 'Behavior Trend'
   - `toLocaleDateString('zh-CN')` → `toLocaleDateString('en-US')`

5. **src/components/dashboard/time-range-selector.tsx**
   - '今日' → 'Today'
   - '最近 7 天' → 'Last 7 Days'
   - '最近 30 天' → 'Last 30 Days'
   - '最近 90 天' → 'Last 90 Days'
   - '选择时间' → 'Select Time'

6. **src/components/dashboard/stats-card-group.tsx**
   - '今日记录' → 'Today\'s Records'
   - '连续活跃' → 'Active Streak'
   - '天' → 'days'
   - '🔥 保持中' → '🔥 Keep Going'
   - '目标达成率' → 'Goal Completion Rate'
   - '% vs 上周' → '% vs Last Week'
   - '本周 vs 上周' → 'This Week vs Last Week'

7. **src/components/dashboard/goal-progress-section.tsx**
   - '暂无进行中的目标' → 'No Active Goals'
   - '创建你的第一个目标' → 'Create Your First Goal'
   - '目标进度' → 'Goal Progress'

8. **src/app/goals/page.tsx**
   - '全部状态' → 'All Status'
   - '进行中' → 'Active'
   - '已完成' → 'Completed'
   - '已放弃' → 'Abandoned'
   - '全部分类' → 'All Categories'
   - '健康' → 'Health'
   - '财务' → 'Finance'
   - '习惯' → 'Habit'
   - '学习' → 'Learning'
   - '其他' → 'Other'
   - '创建时间' → 'Created At'
   - '名称' → 'Name'
   - '目标管理' → 'Goal Management'
   - '+ 创建目标' → '+ Create Goal'
   - '选择状态' → 'Select Status'
   - '选择分类' → 'Select Category'
   - '排序方式' → 'Sort By'
   - '搜索目标名称...' → 'Search goal name...'

9. **src/app/goals/[id]/page.tsx**
   - '确定要删除这个目标吗？' → 'Are you sure you want to delete this goal?'
   - '目标不存在' → 'Goal Not Found'
   - '返回列表' → 'Back to List'
   - '← 返回' → '← Back'
   - '目标详情' → 'Goal Details'
   - '标记为完成' → 'Mark as Completed'
   - '放弃目标' → 'Abandon Goal'
   - '删除' → 'Delete'
   - '分类:' → 'Category:'
   - '开始:' → 'Start:'
   - '结束:' → 'End:'
   - '进度:' → 'Progress:'
   - '剩余:' → 'Remaining:'
   - '天' → 'days'
   - '达成条件' → 'Completion Criteria'
   - '条件 ${index + 1}' → 'Criterion ${index + 1}'
   - '行为:' → 'Behavior:'
   - '指标:' → 'Metric:'
   - '目标:' → 'Target:'
   - '周期:' → 'Period:'
   - `toLocaleDateString('zh-CN')` → `toLocaleDateString('en-US')`

10. **src/components/dashboard/calendar-heatmap.tsx**
    - '日', '一', '二', '三', '四', '五', '六' → 'S', 'M', 'T', 'W', 'T', 'F', 'S'
    - '暂无活跃数据' → 'No Activity Data'
    - '活跃度热力图' → 'Activity Heatmap'
    - '条记录' → 'records'
    - '少' → 'Less'
    - '多' → 'More'
    - `toLocaleDateString('zh-CN')` → `toLocaleDateString('en-US')`

11. **src/utils/settings-pure.ts**
    - '简体中文' → 'Simplified Chinese'
    - '繁體中文' → 'Traditional Chinese'

## 重构步骤

### Step 1: 创建 enum 类型文件
- 在 `src/types/` 下创建新的 enum 定义文件或直接在相关类型文件中定义

### Step 2: 替换类型文件中的联合类型
- 按文件顺序逐一替换，每次替换后验证编译

### Step 3: 替换组件文件中的联合类型
- 更新组件中的类型引用

### Step 4: 替换 UI 中文文本
- 按组件文件顺序逐一替换中文文本

### Step 5: 验证和测试
- 运行 `pnpm tsc --noEmit`
- 运行 `pnpm lint`
- 手动测试 UI 功能

## 风险评估

- **低风险**: 类型重构，TypeScript 会在编译时捕获错误
- **中风险**: UI 文本替换，需要确保所有中文都被替换
- **注意事项**: 
  - 确保 enum 值与原来的字符串值一致
  - 确保所有使用这些类型的地方都更新
  - 确保日期格式化从 'zh-CN' 改为 'en-US'

## 预期影响

- 类型安全性提升
- 代码可维护性提升
- UI 国际化准备（英文界面）

