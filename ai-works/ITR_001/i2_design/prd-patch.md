# ITR_001: Chat 功能增强 - PRD 补丁

> 补丁类型: 功能增强 | 版本: v1.1 | 创建时间: 2026-02-03

## 1. 功能补丁清单

### 新增用户故事

| ID | 用户故事 | 验收标准 | 优先级 |
|---|---|---|---|
| US-C01 | 作为用户，我想删除不需要的 conversation，以保持列表整洁 | 1. 点击删除图标后弹出确认对话框<br>2. 确认后成功删除 conversation 及其消息<br>3. 列表自动刷新<br>4. 删除后关闭当前对话 | P0 |
| US-C02 | 作为用户，我想重命名 conversation 标题，以便更好地识别内容 | 1. 点击编辑图标后标题变为 input 框<br>2. 支持编辑并回车/失焦保存<br>3. 支持 ESC 取消编辑<br>4. 标题长度限制 1-100 字符 | P0 |
| US-C03 | 作为用户，我想在切换 conversation 时看到 loading 状态，以了解系统正在加载 | 1. 点击 conversation 后显示 loading 骨架屏<br>2. 消息加载完成后显示消息列表<br>3. 加载失败显示错误提示 | P0 |
| US-C04 | 作为用户，我希望新建对话时系统自动生成有意义的标题，而不是 "New Conversation" | 1. 发送首条消息后，AI 自动生成标题<br>2. 标题长度 10-30 字符<br>3. 标题能概括对话内容<br>4. 生成失败时使用默认标题 | P0 |
| US-C05 | 作为用户，我希望通过 URL 分享或刷新页面后仍能保持当前对话 | 1. 选中 conversation 后 URL 包含 conversation ID<br>2. 刷新页面后仍保持选中状态<br>3. 支持浏览器前进/后退 | P0 |
| US-C06 | 作为用户，我希望看到用户消息和 AI 消息在视觉上区分更明显（用户在右侧） | 1. 用户消息+头像显示在右侧<br>2. AI 消息+头像显示在左侧<br>3. 保持良好的可读性 | P1 |

## 2. 交互流程

### 2.1 删除 Conversation

```
用户点击删除图标
  ↓
显示确认对话框
  ├─ 取消：关闭对话框
  └─ 确认
      ↓
    调用删除 API
      ↓
    刷新列表
      ↓
    关闭当前对话（如果是当前选中的）
```

### 2.2 重命名 Conversation

```
用户点击编辑图标
  ↓
标题变为 input 框，自动聚焦
  ├─ 回车/失焦：保存
  │   ↓
  │ 调用更新 API
  │   ↓
  │ 刷新列表
  └─ ESC：取消编辑
```

### 2.3 切换 Conversation

```
用户点击 conversation
  ↓
更新 URL query（convId）
  ↓
显示 loading 骨架屏
  ↓
加载消息
  ├─ 成功：渲染消息列表
  └─ 失败：显示错误提示
```

### 2.4 AI 生成标题

```
用户在新对话中发送首条消息
  ↓
消息发送到服务端
  ↓
检测：conversation 是否为新建？
  ├─ 是（messages.length === 0）
  │   ↓
  │ AI 生成标题（基于用户消息）
  │   ↓
  │ 更新 conversation 标题
  │   ↓
  │ 返回 conversation ID 和标题
  └─ 否：跳过
```

## 3. API 接口补丁

### 3.1 新增接口

#### PATCH /api/chat/conversations/[id]

**描述**: 更新 conversation 标题

**请求参数**:
```typescript
{
  title: string; // 1-100 字符
}
```

**响应**:
```typescript
{
  data: Conversation | null;
  error: string | null;
}
```

**错误码**:
- 400: 参数无效（标题为空或超长）
- 401: 未登录
- 404: Conversation 不存在或无权限

#### DELETE /api/chat/conversations/[id]

**描述**: 删除 conversation（及其所有消息）

**响应**:
```typescript
{
  data: null;
  error: string | null;
}
```

**错误码**:
- 401: 未登录
- 404: Conversation 不存在或无权限

### 3.2 修改接口

#### POST /api/chat/message

**修改**: 在首次消息时触发 AI 生成标题

**响应增强**:
```typescript
{
  // 现有响应
  conversationId?: string; // 新建对话时返回
  conversationTitle?: string; // AI 生成的标题
}
```

## 4. 数据模型补丁

### 4.1 类型定义补丁

**新增类型** (`/src/types/chat-server.ts`):
```typescript
export interface UpdateConversationRequest {
  title: string;
}

export interface GenerateTitleParams {
  messageContent: string;
  maxLength?: number;
}
```

## 5. 非功能性需求

### 5.1 性能要求

- 删除操作：< 500ms
- 更新标题：< 300ms
- AI 生成标题：< 3s（异步，不阻塞消息发送）
- 消息加载：< 1s

### 5.2 安全要求

- 所有操作需验证用户权限（userId 匹配）
- 标题长度限制：1-100 字符
- 防止 XSS：标题需 sanitize

### 5.3 可用性要求

- 删除操作必须二次确认
- 编辑态提供清晰的保存/取消提示
- Loading 状态不超过 2s，超过需提示

## 6. 边界条件

### 6.1 删除 Conversation

- 删除最后一个 conversation：列表为空，显示空状态
- 删除当前选中的 conversation：关闭对话，回到空状态
- 删除失败：显示错误 toast，不刷新列表

### 6.2 重命名 Conversation

- 标题为空：不允许保存，显示提示
- 标题超长（>100）：截断或禁止保存
- 更新失败：恢复原标题，显示错误 toast

### 6.3 AI 生成标题

- 用户消息过短（<5 字符）：使用默认标题
- AI 服务失败：使用默认标题 "New Conversation"
- 生成的标题超长：截断到 30 字符

### 6.4 URL Query 同步

- URL 中的 convId 不存在：忽略，显示空状态
- 无权限访问：显示错误提示，清空 query

---

**设计完成时间**: 2026-02-03  
**设计人**: AI Assistant

