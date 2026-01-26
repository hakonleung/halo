# API 规格：目标管理

## 基础信息

- **Base URL**: `/api/goals`
- **认证**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 错误响应格式

```typescript
{
  error: string;
  message?: string;
}
```

## API 端点

### 1. GET /api/goals

获取用户所有目标

**请求**:
```
GET /api/goals?status=active&category=health&sort=created_at&order=desc
```

**Query 参数**:
- `status?`: 'active' | 'completed' | 'abandoned' (可选)
- `category?`: string (可选)
- `sort?`: 'created_at' | 'progress' | 'name' (默认: 'created_at')
- `order?`: 'asc' | 'desc' (默认: 'desc')

**响应** (200):
```typescript
{
  data: Goal[];
  error?: null;
}
```

**响应** (401):
```typescript
{
  data: null;
  error: 'Not authenticated';
}
```

**响应** (500):
```typescript
{
  data: null;
  error: string;
}
```

**示例**:
```bash
curl -X GET \
  'https://api.example.com/api/goals?status=active&sort=created_at&order=desc' \
  -H 'Authorization: Bearer <token>'
```

### 2. POST /api/goals

创建新目标

**请求**:
```
POST /api/goals
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```typescript
{
  name: string; // 必填，最大 100 字符
  description?: string;
  category: string; // 必填
  startDate: string; // 必填，ISO 8601
  endDate?: string; // 可选，ISO 8601，必须 ≥ startDate
  criteria: GoalCriteria[]; // 必填，至少一个
}
```

**响应** (201):
```typescript
{
  data: Goal;
  error?: null;
}
```

**响应** (400):
```typescript
{
  data: null;
  error: 'Validation failed';
  message?: string; // 详细错误信息
}
```

**响应** (401):
```typescript
{
  data: null;
  error: 'Not authenticated';
}
```

**示例**:
```bash
curl -X POST \
  'https://api.example.com/api/goals' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "每日运动 30 分钟",
    "description": "坚持每天运动，保持身体健康",
    "category": "health",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "criteria": [{
      "behaviorId": "uuid",
      "metric": "count",
      "operator": ">=",
      "value": 100,
      "period": "monthly",
      "description": "每月至少运动 100 次"
    }]
  }'
```

### 3. GET /api/goals/[id]

获取单个目标详情

**请求**:
```
GET /api/goals/{id}
```

**Path 参数**:
- `id`: string (目标 ID)

**响应** (200):
```typescript
{
  data: Goal & {
    progress: GoalProgress;
  };
  error?: null;
}
```

**响应** (404):
```typescript
{
  data: null;
  error: 'Goal not found';
}
```

**响应** (401):
```typescript
{
  data: null;
  error: 'Not authenticated';
}
```

**示例**:
```bash
curl -X GET \
  'https://api.example.com/api/goals/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer <token>'
```

### 4. PATCH /api/goals/[id]

更新目标

**请求**:
```
PATCH /api/goals/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

**Path 参数**:
- `id`: string (目标 ID)

**Body**:
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  criteria?: GoalCriteria[];
  status?: 'active' | 'completed' | 'abandoned';
}
```

**响应** (200):
```typescript
{
  data: Goal;
  error?: null;
}
```

**响应** (400):
```typescript
{
  data: null;
  error: 'Validation failed';
  message?: string;
}
```

**响应** (404):
```typescript
{
  data: null;
  error: 'Goal not found';
}
```

**响应** (401):
```typescript
{
  data: null;
  error: 'Not authenticated';
}
```

**示例**:
```bash
curl -X PATCH \
  'https://api.example.com/api/goals/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "每日运动 45 分钟",
    "status": "active"
  }'
```

### 5. DELETE /api/goals/[id]

删除目标

**请求**:
```
DELETE /api/goals/{id}
```

**Path 参数**:
- `id`: string (目标 ID)

**响应** (200):
```typescript
{
  error?: null;
}
```

**响应** (404):
```typescript
{
  error: 'Goal not found';
}
```

**响应** (401):
```typescript
{
  error: 'Not authenticated';
}
```

**示例**:
```bash
curl -X DELETE \
  'https://api.example.com/api/goals/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer <token>'
```

### 6. GET /api/goals/[id]/progress (可选)

获取目标进度

**请求**:
```
GET /api/goals/{id}/progress
```

**Path 参数**:
- `id`: string (目标 ID)

**响应** (200):
```typescript
{
  data: GoalProgress;
  error?: null;
}
```

**响应** (404):
```typescript
{
  data: null;
  error: 'Goal not found';
}
```

**响应** (401):
```typescript
{
  data: null;
  error: 'Not authenticated';
}
```

**示例**:
```bash
curl -X GET \
  'https://api.example.com/api/goals/123e4567-e89b-12d3-a456-426614174000/progress' \
  -H 'Authorization: Bearer <token>'
```

## 数据类型

### GoalCriteria

```typescript
interface GoalCriteria {
  behaviorId: string; // 关联的行为定义 ID
  metric: 'count' | 'sum' | 'avg'; // 指标类型
  operator: '>' | '>=' | '<' | '<=' | '=='; // 比较运算符
  value: number; // 目标值
  period: 'daily' | 'weekly' | 'monthly'; // 周期
  description: string; // 人类可读描述
}
```

### GoalProgress

```typescript
interface GoalProgress {
  current: number; // 当前值
  target: number; // 目标值
  progress: number; // 进度百分比 (0-100)
  isCompleted: boolean; // 是否已完成
  remainingDays?: number; // 剩余天数
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 200 | - | 成功 |
| 201 | - | 创建成功 |
| 400 | VALIDATION_ERROR | 数据验证失败 |
| 401 | UNAUTHORIZED | 未认证 |
| 403 | FORBIDDEN | 无权限 |
| 404 | NOT_FOUND | 资源不存在 |
| 500 | INTERNAL_ERROR | 服务器错误 |

## 速率限制

- 每个用户每分钟最多 60 次请求
- 创建目标每分钟最多 10 次

## 版本控制

当前版本: v1

未来可能添加版本前缀: `/api/v1/goals`

