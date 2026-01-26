# PRD: 目标管理模块

## 1. 概述

### 1.1 背景
NEO-LOG 是一个 AI 驱动的个人生活追踪系统。虽然数据库 schema 中已有 `neolog_goals` 表，但缺少完整的前端界面和 API 路由。用户需要能够设定和管理目标，将行为记录与目标关联，并追踪目标的完成进度。

### 1.2 目标
- 提供完整的目标管理功能（CRUD）
- 实现目标进度自动计算
- 提供友好的用户界面
- 确保系统性能和代码质量

### 1.3 成功指标
- 功能完整性：所有 Must Have 功能实现率 = 100%
- 代码质量：TypeScript 类型错误 = 0，ESLint 错误 = 0
- 测试覆盖率：≥ 80%
- 性能：目标列表加载时间 < 500ms，进度计算时间 < 200ms
- 用户体验：目标创建成功率 ≥ 95%，页面加载时间 < 1s

## 2. 用户故事

### US-001: 创建目标
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够创建新目标，**以便** 追踪我想要达成的目标。

**验收标准**:
- AC-001-1: Given 用户已登录，When 用户进入 `/goals` 页面并点击"创建目标"按钮，Then 显示目标创建表单
- AC-001-2: Given 用户填写目标信息（名称、描述、分类、开始日期、结束日期），When 用户点击"保存"，Then 系统验证数据并创建目标
- AC-001-3: Given 用户未填写必填字段（名称、开始日期），When 用户点击"保存"，Then 显示验证错误提示
- AC-001-4: Given 用户设置达成条件（关联行为、指标、目标值、周期），When 用户保存目标，Then 系统保存达成条件
- AC-001-5: Given 目标创建成功，When 系统返回成功响应，Then 自动刷新目标列表并显示成功提示

### US-002: 查看目标列表
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够查看我的所有目标，**以便** 了解我的目标状态和进度。

**验收标准**:
- AC-002-1: Given 用户已登录，When 用户进入 `/goals` 页面，Then 显示用户的所有目标列表
- AC-002-2: Given 目标列表，When 用户查看列表，Then 每个目标显示名称、描述、分类、进度、状态
- AC-002-3: Given 目标列表，When 用户按状态筛选（active/completed/abandoned），Then 只显示对应状态的目标
- AC-002-4: Given 目标列表，When 用户点击目标卡片，Then 显示目标详情页面

### US-003: 查看目标详情
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够查看目标的详细信息，**以便** 了解目标的完整信息和进度。

**验收标准**:
- AC-003-1: Given 用户已登录，When 用户点击目标卡片，Then 显示目标详情页面
- AC-003-2: Given 目标详情页面，When 用户查看详情，Then 显示目标的所有信息（名称、描述、分类、日期、达成条件、进度）
- AC-003-3: Given 目标详情页面，When 用户查看进度，Then 显示当前值/目标值、进度百分比、进度趋势图
- AC-003-4: Given 目标详情页面，When 用户查看关联的行为记录，Then 显示相关的行为记录列表

### US-004: 编辑目标
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够编辑已创建的目标，**以便** 更新目标信息或调整达成条件。

**验收标准**:
- AC-004-1: Given 用户已登录，When 用户在目标详情页面点击"编辑"按钮，Then 显示目标编辑表单（预填充现有数据）
- AC-004-2: Given 用户修改目标信息，When 用户点击"保存"，Then 系统验证并更新目标
- AC-004-3: Given 用户修改达成条件，When 用户保存，Then 系统重新计算目标进度
- AC-004-4: Given 目标更新成功，When 系统返回成功响应，Then 更新目标列表显示

### US-005: 删除目标
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够删除不需要的目标，**以便** 保持目标列表的整洁。

**验收标准**:
- AC-005-1: Given 用户已登录，When 用户在目标详情页面点击"删除"按钮，Then 显示确认对话框
- AC-005-2: Given 确认对话框，When 用户确认删除，Then 系统删除目标
- AC-005-3: Given 目标删除成功，When 系统返回成功响应，Then 从目标列表中移除该目标

### US-006: 自动计算目标进度
**优先级**: P0 (Must Have)

**作为** 系统，**我希望** 能够根据行为记录自动计算目标进度，**以便** 用户无需手动更新进度。

**验收标准**:
- AC-006-1: Given 目标有达成条件（关联行为、指标、目标值、周期），When 系统计算进度，Then 根据行为记录计算当前值
- AC-006-2: Given 目标进度计算，When 当前值达到或超过目标值，Then 系统自动更新目标状态为 `completed`
- AC-006-3: Given 目标进度计算，When 计算完成，Then 更新目标的进度百分比
- AC-006-4: Given 目标进度计算，When 计算时间超过 200ms，Then 系统记录警告日志

### US-007: 更新目标状态
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够手动更新目标状态，**以便** 标记目标为完成或放弃。

**验收标准**:
- AC-007-1: Given 用户已登录，When 用户在目标详情页面点击"标记为完成"，Then 系统更新目标状态为 `completed`
- AC-007-2: Given 用户已登录，When 用户在目标详情页面点击"放弃目标"，Then 系统更新目标状态为 `abandoned`
- AC-007-3: Given 目标状态更新，When 系统更新成功，Then 更新目标列表显示

### US-008: 目标进度可视化
**优先级**: P0 (Must Have)

**作为** 普通用户，**我希望** 能够可视化查看目标进度，**以便** 直观了解目标完成情况。

**验收标准**:
- AC-008-1: Given 目标列表，When 用户查看目标，Then 每个目标显示进度环（百分比）
- AC-008-2: Given 目标详情页面，When 用户查看进度，Then 显示进度趋势图
- AC-008-3: Given 目标进度可视化，When 进度接近完成，Then 进度环颜色变化（如绿色）

### US-009: 目标筛选和排序
**优先级**: P1 (Should Have)

**作为** 普通用户，**我希望** 能够筛选和排序目标，**以便** 快速找到我想要查看的目标。

**验收标准**:
- AC-009-1: Given 目标列表，When 用户按状态筛选，Then 只显示对应状态的目标
- AC-009-2: Given 目标列表，When 用户按分类筛选，Then 只显示对应分类的目标
- AC-009-3: Given 目标列表，When 用户按创建时间排序，Then 目标按时间顺序显示

### US-010: 目标提醒
**优先级**: P2 (Could Have)

**作为** 普通用户，**我希望** 能够接收目标提醒，**以便** 及时了解目标进度和需要关注的事项。

**验收标准**:
- AC-010-1: Given 用户已启用目标提醒，When 目标进度落后，Then 系统发送提醒通知
- AC-010-2: Given 用户已启用目标提醒，When 目标即将到期，Then 系统发送提醒通知

## 3. 功能规格

### 3.1 API 路由

#### GET /api/goals
获取用户所有目标

**请求**:
- Headers: Authorization Bearer token
- Query: `status?` (可选，筛选状态)

**响应**:
```typescript
{
  data: Goal[];
  error?: string;
}
```

#### POST /api/goals
创建新目标

**请求**:
- Headers: Authorization Bearer token
- Body: `GoalCreateRequest`

**响应**:
```typescript
{
  data: Goal;
  error?: string;
}
```

#### PATCH /api/goals/[id]
更新目标

**请求**:
- Headers: Authorization Bearer token
- Body: `Partial<GoalCreateRequest>`

**响应**:
```typescript
{
  data: Goal;
  error?: string;
}
```

#### DELETE /api/goals/[id]
删除目标

**请求**:
- Headers: Authorization Bearer token

**响应**:
```typescript
{
  error?: string;
}
```

### 3.2 前端页面

#### /goals
目标管理页面

**功能**:
- 显示目标列表
- 创建新目标
- 筛选和排序
- 导航到目标详情

#### /goals/[id]
目标详情页面

**功能**:
- 显示目标详细信息
- 显示目标进度
- 编辑目标
- 删除目标
- 更新目标状态

### 3.3 组件

#### GoalList
目标列表组件

**Props**:
```typescript
{
  goals: Goal[];
  loading?: boolean;
  onGoalClick: (goalId: string) => void;
  onCreateClick: () => void;
}
```

#### GoalForm
目标表单组件

**Props**:
```typescript
{
  goal?: Goal;
  onSubmit: (goal: GoalCreateRequest) => void;
  onCancel: () => void;
}
```

#### GoalProgressRing
目标进度环组件（增强现有组件）

**Props**:
```typescript
{
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  size?: number;
}
```

### 3.4 React Hooks

#### use-goals.ts
目标数据获取和操作

**功能**:
- `useGoals()` - 获取目标列表
- `useGoal(id)` - 获取单个目标
- `useCreateGoal()` - 创建目标 mutation
- `useUpdateGoal()` - 更新目标 mutation
- `useDeleteGoal()` - 删除目标 mutation

### 3.5 目标进度计算

**算法**:
1. 根据目标的 `criteria` 获取达成条件
2. 根据 `behaviorId` 查询相关的行为记录
3. 根据 `period` 筛选时间范围内的记录
4. 根据 `metric` 计算指标值（count/sum/avg）
5. 根据 `operator` 和 `value` 判断是否达成
6. 计算进度百分比

**性能优化**:
- 缓存计算结果
- 异步计算，不阻塞 UI
- 批量计算多个目标

## 4. 非功能需求

### 4.1 性能
- 目标列表加载时间 < 500ms
- 目标进度计算时间 < 200ms
- 页面加载时间 < 1s

### 4.2 可用性
- 目标创建成功率 ≥ 95%
- 表单验证错误提示清晰
- 加载状态明确

### 4.3 安全性
- 用户只能访问自己的目标（RLS）
- API 请求需要认证
- 输入数据验证和清理

### 4.4 可维护性
- TypeScript 类型安全
- 代码遵循项目规范
- 测试覆盖率 ≥ 80%

## 5. 约束与依赖

### 5.1 技术约束
- 使用 Next.js App Router
- 使用 TanStack Query
- 使用 Chakra UI
- 遵循项目代码规范

### 5.2 数据约束
- 目标名称最大 100 字符
- 单个用户最多 100 个活跃目标
- 目标名称唯一性（同一用户）

### 5.3 依赖关系
- 依赖 `neolog_behavior_records` 表
- 依赖 `neolog_behavior_definitions` 表
- 依赖认证系统

## 6. 里程碑

### M1: API 路由完成
- [ ] GET /api/goals
- [ ] POST /api/goals
- [ ] PATCH /api/goals/[id]
- [ ] DELETE /api/goals/[id]

### M2: 前端页面完成
- [ ] /goals 页面
- [ ] /goals/[id] 页面
- [ ] 目标列表组件
- [ ] 目标表单组件

### M3: 进度计算完成
- [ ] 进度计算算法
- [ ] 进度可视化
- [ ] 自动状态更新

### M4: 测试和优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化

## 7. 开放问题

1. **目标进度计算频率**: 实时计算还是定时计算？
   - 建议：实时计算（用户查看时计算），缓存结果

2. **目标达成通知**: 是否需要推送通知？
   - 建议：P2 功能，后续实现

3. **目标模板**: 是否需要预设模板？
   - 建议：P2 功能，后续实现

4. **目标分析**: 是否需要目标完成率统计？
   - 建议：P2 功能，后续实现

