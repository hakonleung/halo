# REF_004: API 重构计划

## 重构目标

重构所有 API 路由，抽取公共的鉴权逻辑，统一响应格式。

## 分析结果

### 当前问题

1. **重复的鉴权逻辑**：每个需要鉴权的 API 都重复以下代码：
   ```typescript
   const supabase = await getSupabaseClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
     return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
   }
   ```

2. **响应格式不一致**：
   - 大部分：`{ data: T | null, error: string | null }`
   - settings：`{ settings: T | null, error: string | null }`
   - auth：`{ user: T | null, session: T | null, error: string }`
   - dashboard：`{ data: T }` 或 `{ error: string, message: string }`
   - history：`{ items: T[], total: number, error: string | null }`
   - DELETE：`{ error: string | null }`

3. **错误处理重复**：每个 API 都有相同的 try-catch 和错误处理逻辑

### 需要重构的 API 列表

#### 需要鉴权的 API（使用 withSupabaseAndAuth）：
1. `src/app/api/notes/route.ts` - GET, POST
2. `src/app/api/notes/[id]/route.ts` - PATCH, DELETE
3. `src/app/api/settings/route.ts` - GET, PATCH
4. `src/app/api/goals/route.ts` - GET, POST
5. `src/app/api/goals/[id]/route.ts` - GET, PATCH, DELETE
6. `src/app/api/behaviors/records/route.ts` - GET, POST
7. `src/app/api/behaviors/records/[id]/route.ts` - PATCH, DELETE
8. `src/app/api/behaviors/definitions/route.ts` - GET, POST
9. `src/app/api/behaviors/definitions/[id]/route.ts` - PATCH
10. `src/app/api/dashboard/stats/route.ts` - GET
11. `src/app/api/dashboard/heatmap/route.ts` - GET
12. `src/app/api/dashboard/trends/route.ts` - GET
13. `src/app/api/history/route.ts` - GET
14. `src/app/api/chat/conversations/route.ts` - GET, POST
15. `src/app/api/chat/conversations/[id]/messages/route.ts` - GET
16. `src/app/api/chat/message/route.ts` - POST (特殊：流式响应)
17. `src/app/api/auth/me/route.ts` - GET

#### 不需要鉴权的 API（保持原样）：
1. `src/app/api/auth/login/route.ts` - POST (需要 cookie 支持)
2. `src/app/api/auth/signup/route.ts` - POST
3. `src/app/api/auth/logout/route.ts` - POST (需要 cookie 支持)

### 重构方案

#### 1. 创建 `withSupabaseAndAuth` 辅助函数

位置：`src/lib/api-helpers.ts`

```typescript
export async function withSupabaseAndAuth<T>(
  callback: (supabase: SupabaseClient<Database>, user: User) => Promise<{ data: T } | { error: string }>
): Promise<NextResponse<{ data: T | null; error: string | null }>>
```

功能：
- 获取 supabase client
- 获取并验证 user
- 处理鉴权错误
- 执行 callback
- 处理 callback 错误
- 统一返回格式

#### 2. 统一 ApiResponse 类型

在 `src/lib/internal-api/base.ts` 中已有 `ApiResponse<T>` 类型定义：
```typescript
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
```

所有 API 响应统一使用此类型。

#### 3. 特殊处理

- **流式响应**（chat/message）：保持原样，不使用 withSupabaseAndAuth
- **需要 cookie 的 API**（login/logout）：保持原样，使用 `getSupabaseClientForApiRoute`
- **特殊响应格式**（dashboard、history）：在 callback 中处理，最终统一为 `ApiResponse<T>`

## 重构步骤

1. **R3-1**: 创建 `withSupabaseAndAuth` 辅助函数
2. **R3-2**: 统一 ApiResponse 类型（已存在，确保所有地方使用）
3. **R3-3**: 逐个重构 API 路由
   - 先重构简单的（notes, settings）
   - 再重构复杂的（goals, behaviors）
   - 最后处理特殊的（dashboard, history, chat）

## 风险评估

- **低风险**：纯代码重构，不改变功能
- **注意事项**：
  - 确保所有响应格式统一
  - 保持错误处理逻辑一致
  - 特殊 API（流式响应、cookie）保持原样

