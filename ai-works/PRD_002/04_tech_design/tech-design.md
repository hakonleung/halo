# 技术设计文档：目标管理模块

## 1. 数据模型

### 1.1 数据库表结构

**表名**: `neolog_goals` (已存在)

**字段定义**:
```typescript
{
  id: uuid (PK, defaultRandom)
  user_id: uuid (NOT NULL, references auth.users)
  name: text (NOT NULL, max 100)
  description: text (nullable)
  category: text (NOT NULL) // 'health' | 'finance' | 'habit' | 'learning' | 'other'
  start_date: timestamp (NOT NULL)
  end_date: timestamp (nullable)
  criteria: jsonb (NOT NULL, default []) // GoalCriteria[]
  status: text (default 'active') // 'active' | 'completed' | 'abandoned'
  created_at: timestamp (defaultNow)
  updated_at: timestamp (defaultNow)
}
```

**索引**:
- `user_id` (已有 RLS 策略)
- `status` (用于筛选)
- `category` (用于筛选)
- `created_at` (用于排序)

**RLS 策略** (已存在):
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### 1.2 达成条件结构 (GoalCriteria)

```typescript
interface GoalCriteria {
  behavior_id: string; // 关联的行为定义 ID
  metric: 'count' | 'sum' | 'avg'; // 指标类型
  operator: '>' | '>=' | '<' | '<=' | '=='; // 比较运算符
  value: number; // 目标值
  period: 'daily' | 'weekly' | 'monthly'; // 周期
  description: string; // 人类可读描述
}
```

### 1.3 关联表

- `neolog_behavior_definitions` - 行为定义表（用于选择关联行为）
- `neolog_behavior_records` - 行为记录表（用于计算进度）

### 1.4 ER 关系图

```
neolog_goals
  ├── user_id → auth.users (1:N)
  └── criteria[].behavior_id → neolog_behavior_definitions (N:M)
      └── 通过 behavior_records 计算进度
```

## 2. API 接口

### 2.1 GET /api/goals

**功能**: 获取用户所有目标

**请求**:
- Headers: Authorization Bearer token
- Query:
  - `status?`: 'active' | 'completed' | 'abandoned'
  - `category?`: string
  - `sort?`: 'created_at' | 'progress' | 'name'
  - `order?`: 'asc' | 'desc'

**响应**:
```typescript
{
  data: Goal[];
  error?: string;
}
```

**实现**:
- 调用 `goalService.getGoals()`
- 支持筛选和排序
- 返回目标列表（包含进度计算）

### 2.2 POST /api/goals

**功能**: 创建新目标

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

**验证**:
- 目标名称: 必填，最大 100 字符
- 开始日期: 必填
- 结束日期: 如果填写，必须 ≥ 开始日期
- 达成条件: 至少一个

**实现**:
- 调用 `goalService.createGoal()`
- 验证数据
- 创建目标

### 2.3 GET /api/goals/[id]

**功能**: 获取单个目标详情

**请求**:
- Headers: Authorization Bearer token
- Params: `id` (目标 ID)

**响应**:
```typescript
{
  data: Goal & { progress: GoalProgress };
  error?: string;
}
```

**实现**:
- 调用 `goalService.getGoal(id)`
- 计算目标进度
- 返回目标详情和进度

### 2.4 PATCH /api/goals/[id]

**功能**: 更新目标

**请求**:
- Headers: Authorization Bearer token
- Params: `id` (目标 ID)
- Body: `Partial<GoalCreateRequest>`

**响应**:
```typescript
{
  data: Goal;
  error?: string;
}
```

**验证**:
- 同 POST /api/goals

**实现**:
- 调用 `goalService.updateGoal()`
- 验证数据
- 更新目标
- 如果达成条件改变，重新计算进度

### 2.5 DELETE /api/goals/[id]

**功能**: 删除目标

**请求**:
- Headers: Authorization Bearer token
- Params: `id` (目标 ID)

**响应**:
```typescript
{
  error?: string;
}
```

**实现**:
- 调用 `goalService.deleteGoal()`
- 删除目标

### 2.6 GET /api/goals/[id]/progress

**功能**: 获取目标进度（可选，用于实时更新）

**请求**:
- Headers: Authorization Bearer token
- Params: `id` (目标 ID)

**响应**:
```typescript
{
  data: GoalProgress;
  error?: string;
}
```

**实现**:
- 计算目标进度
- 返回进度信息

## 3. 类型定义

### 3.1 Server 类型 (goal-server.ts)

```typescript
// 已存在，需要确认完整性
export type Goal = InferSelectModel<typeof neologGoals> & {
  criteria: GoalCriteria[];
};

export interface GoalCriteria {
  behavior_id: string;
  metric: 'count' | 'sum' | 'avg';
  operator: '>' | '>=' | '<' | '<=' | '==';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  description: string;
}

export type GoalCreateRequest = Partial<InferInsertModel<typeof neologGoals>> & {
  criteria: GoalCriteria[];
};

export interface GoalProgress {
  current: number;
  target: number;
  progress: number; // 0-100
  isCompleted: boolean;
  remainingDays?: number;
}
```

### 3.2 Client 类型 (goal-client.ts)

```typescript
// 已存在，需要确认完整性
export interface GoalCriteria {
  behaviorId: string; // camelCase
  metric: 'count' | 'sum' | 'avg';
  operator: '>' | '>=' | '<' | '<=' | '==';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  description: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  criteria: GoalCriteria[];
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreateRequest {
  name: string;
  description?: string;
  category: string;
  startDate: string;
  endDate?: string;
  criteria: GoalCriteria[];
}

export interface GoalProgress {
  current: number;
  target: number;
  progress: number; // 0-100
  isCompleted: boolean;
  remainingDays?: number;
}

export interface GoalListResponse {
  data: Goal[];
  total?: number;
}
```

### 3.3 类型转换

**Server → Client**:
- `behavior_id` → `behaviorId`
- `user_id` → `userId`
- `start_date` → `startDate`
- `end_date` → `endDate`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- Date → ISO string

**Client → Server**:
- 反向转换

## 4. 组件架构

### 4.1 页面组件

```
src/app/goals/
  ├── page.tsx (目标列表页面)
  └── [id]/
      └── page.tsx (目标详情页面)
```

### 4.2 业务组件

```
src/components/goals/
  ├── goal-list.tsx (目标列表)
  ├── goal-card.tsx (目标卡片)
  ├── goal-form.tsx (目标表单)
  ├── goal-criteria-form.tsx (达成条件表单)
  ├── goal-status-badge.tsx (状态徽章)
  ├── goal-progress-chart.tsx (进度趋势图)
  └── index.ts (导出)
```

### 4.3 Hooks

```
src/hooks/
  └── use-goals.ts
    ├── useGoals() - 获取目标列表
    ├── useGoal(id) - 获取单个目标
    ├── useCreateGoal() - 创建目标 mutation
    ├── useUpdateGoal() - 更新目标 mutation
    └── useDeleteGoal() - 删除目标 mutation
```

### 4.4 Service 层

```
src/lib/
  └── goal-service.ts (已存在，需增强)
    ├── getGoals() - 获取目标列表
    ├── getGoal() - 获取单个目标
    ├── createGoal() - 创建目标
    ├── updateGoal() - 更新目标
    ├── deleteGoal() - 删除目标
    └── calculateProgress() - 计算目标进度 (新增)
```

### 4.5 进度计算服务

```typescript
// src/lib/goal-progress-service.ts (新建)
export const goalProgressService = {
  async calculateProgress(
    supabase: SupabaseClient,
    userId: string,
    goal: Goal
  ): Promise<GoalProgress> {
    // 1. 获取目标的达成条件
    // 2. 根据 behavior_id 查询行为记录
    // 3. 根据 period 筛选时间范围
    // 4. 根据 metric 计算指标值
    // 5. 根据 operator 和 value 判断是否达成
    // 6. 计算进度百分比
    // 7. 返回进度信息
  }
}
```

## 5. 任务拆分

### 5.1 阶段 05a: 实现前置

- [ ] 确认类型定义完整性
- [ ] 创建进度计算服务类型测试
- [ ] 准备测试环境

### 5.2 阶段 05b: 后端实现

- [ ] 创建 API 路由 `/api/goals/route.ts`
- [ ] 创建 API 路由 `/api/goals/[id]/route.ts`
- [ ] 增强 `goal-service.ts`:
  - [ ] 添加 `getGoal(id)` 方法
  - [ ] 添加筛选和排序支持
- [ ] 创建 `goal-progress-service.ts`:
  - [ ] 实现 `calculateProgress()` 方法
  - [ ] 支持多种指标类型 (count/sum/avg)
  - [ ] 支持多种周期 (daily/weekly/monthly)
  - [ ] 性能优化（缓存、批量计算）
- [ ] 编写单元测试:
  - [ ] `goal-service.test.ts`
  - [ ] `goal-progress-service.test.ts`
  - [ ] API 路由测试

### 5.3 阶段 05c: 前端实现

- [ ] 创建 React Hook `use-goals.ts`:
  - [ ] `useGoals()` - 列表查询
  - [ ] `useGoal(id)` - 详情查询
  - [ ] `useCreateGoal()` - 创建 mutation
  - [ ] `useUpdateGoal()` - 更新 mutation
  - [ ] `useDeleteGoal()` - 删除 mutation
- [ ] 创建页面组件:
  - [ ] `app/goals/page.tsx` - 列表页面
  - [ ] `app/goals/[id]/page.tsx` - 详情页面
- [ ] 创建业务组件:
  - [ ] `components/goals/goal-list.tsx`
  - [ ] `components/goals/goal-card.tsx`
  - [ ] `components/goals/goal-form.tsx`
  - [ ] `components/goals/goal-criteria-form.tsx`
  - [ ] `components/goals/goal-status-badge.tsx`
  - [ ] `components/goals/goal-progress-chart.tsx`
- [ ] 增强现有组件:
  - [ ] `components/dashboard/goal-progress-ring.tsx` - 支持更多尺寸
- [ ] 编写组件测试:
  - [ ] `goal-list.test.tsx`
  - [ ] `goal-card.test.tsx`
  - [ ] `goal-form.test.tsx`

## 6. 测试策略

### 6.1 单元测试

**后端**:
- `goal-service.test.ts`: 测试 CRUD 操作
- `goal-progress-service.test.ts`: 测试进度计算逻辑
  - 测试不同指标类型 (count/sum/avg)
  - 测试不同周期 (daily/weekly/monthly)
  - 测试边界条件

**前端**:
- `use-goals.test.ts`: 测试 Hooks
- `goal-form.test.ts`: 测试表单验证
- `goal-progress-ring.test.tsx`: 测试进度环组件

### 6.2 集成测试

- API 路由集成测试:
  - GET /api/goals
  - POST /api/goals
  - GET /api/goals/[id]
  - PATCH /api/goals/[id]
  - DELETE /api/goals/[id]

### 6.3 E2E 测试

- 创建目标流程
- 查看目标列表
- 查看目标详情
- 编辑目标
- 删除目标
- 目标进度计算

### 6.4 性能测试

- 目标列表加载时间 < 500ms
- 目标进度计算时间 < 200ms
- 大量目标时的性能表现

## 7. 性能优化

### 7.1 进度计算优化

- **缓存**: 缓存计算结果，避免重复计算
- **批量计算**: 批量计算多个目标的进度
- **异步计算**: 不阻塞 UI，异步计算进度
- **增量更新**: 只计算变化的部分

### 7.2 数据查询优化

- **索引**: 确保必要的索引存在
- **分页**: 目标列表支持分页
- **筛选**: 在数据库层面进行筛选，减少数据传输

### 7.3 前端优化

- **懒加载**: 目标列表懒加载
- **虚拟滚动**: 大量目标时使用虚拟滚动
- **缓存**: 使用 TanStack Query 缓存

## 8. 错误处理

### 8.1 API 错误

- 401: 未认证
- 403: 无权限
- 404: 目标不存在
- 400: 数据验证失败
- 500: 服务器错误

### 8.2 前端错误处理

- 显示友好的错误提示
- 重试机制
- 错误日志记录

## 9. 安全考虑

### 9.1 数据验证

- 输入数据验证和清理
- SQL 注入防护（使用参数化查询）
- XSS 防护

### 9.2 权限控制

- RLS 策略确保用户只能访问自己的目标
- API 路由验证用户身份

### 9.3 数据限制

- 目标名称最大 100 字符
- 单个用户最多 100 个活跃目标
- 达成条件数量限制

