# ITR_001: Chat 功能增强 - 技术设计补丁

> 补丁类型: 技术增强 | 版本: v1.1 | 创建时间: 2026-02-03

## 1. 架构变更

### 1.1 数据流补丁

```
【新增流程：URL Query 同步】
URL Query (convId)
    ↕️ (useUrlQuery hook)
Component State (selectedConvId)
    ↓ (useChat hook)
TanStack Query (messages)
    ↓
API /api/chat/conversations/[id]/messages
    ↓
Database (neolog_messages)
```

```
【新增流程：AI 生成标题】
User sends first message
    ↓
POST /api/chat/message
    ↓
Check: messages.length === 0?
    ↓ (Yes)
generateConversationTitle(content)
    ↓ (LLM)
Update conversation.title
    ↓
Return { conversationId, conversationTitle }
    ↓
Frontend: update conversation in cache
```

## 2. API 路由设计

### 2.1 新增路由

#### PATCH /api/chat/conversations/[id]/route.ts

**文件路径**: `/src/app/api/chat/conversations/[id]/route.ts`

**实现**:
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withSupabaseAndAuth(request, async (supabase, user) => {
    const { title } = await request.json();
    
    // 验证
    if (!title || title.length === 0 || title.length > 100) {
      return NextResponse.json(
        { data: null, error: 'Invalid title' },
        { status: 400 }
      );
    }
    
    // 更新
    const updatedConv = await chatService.updateConversation(
      supabase,
      user.id,
      params.id,
      { title }
    );
    
    return NextResponse.json({ data: updatedConv, error: null });
  });
}
```

#### DELETE /api/chat/conversations/[id]/route.ts

**文件路径**: `/src/app/api/chat/conversations/[id]/route.ts`

**实现**:
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withSupabaseAndAuth(request, async (supabase, user) => {
    await chatService.deleteConversation(supabase, user.id, params.id);
    return NextResponse.json({ data: null, error: null });
  });
}
```

### 2.2 修改路由

#### POST /api/chat/message/route.ts

**修改**: 新增 AI 生成标题逻辑

**伪代码**:
```typescript
// 1. 保存用户消息
const userMessage = await chatService.saveMessage(/* ... */);

// 2. 检查是否需要生成标题
const messages = await chatService.getMessages(supabase, userId, conversationId);
if (messages.length === 1) {
  // 首条消息，触发 AI 生成标题
  const title = await generateConversationTitle(userMessage.content);
  await chatService.updateConversation(supabase, userId, conversationId, { title });
}

// 3. 生成 AI 回复（流式）
// ...
```

## 3. Service 层设计

### 3.1 Chat Service 补丁

**文件**: `/src/lib/chat-service.ts`

**新增方法**:
```typescript
/**
 * Update conversation (e.g. title)
 */
async updateConversation(
  supabase: SupabaseClient<Database>,
  userId: string,
  conversationId: string,
  updates: { title?: string }
) {
  if (!userId || !conversationId) {
    throw new Error('User ID and Conversation ID are required');
  }
  
  const { data, error } = await supabase
    .from('neolog_conversations')
    .update({
      title: updates.title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return serverConvertConversation(data);
}
```

### 3.2 AI Agent Service

**文件**: `/src/lib/agents/title-generator.ts` (新建)

**实现**:
```typescript
import { ChatOpenAI } from '@langchain/openai';

export async function generateConversationTitle(
  messageContent: string,
  options?: {
    maxLength?: number;
    language?: 'en' | 'zh-CN';
  }
): Promise<string> {
  const { maxLength = 30, language = 'zh-CN' } = options ?? {};
  
  // 1. 验证输入
  if (!messageContent || messageContent.length < 5) {
    return 'New Conversation';
  }
  
  // 2. 构建 prompt
  const prompt = language === 'zh-CN'
    ? `根据以下用户消息，生成一个简洁的对话标题（10-${maxLength} 字符）。只返回标题，不要解释。\n\n用户消息：${messageContent.slice(0, 200)}`
    : `Generate a concise conversation title (10-${maxLength} characters) based on the user message below. Return only the title.\n\nUser message: ${messageContent.slice(0, 200)}`;
  
  try {
    // 3. 调用 LLM
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini', // 快速且便宜
      temperature: 0.3,
      maxTokens: 50,
    });
    
    const response = await model.invoke(prompt);
    let title = response.content.toString().trim();
    
    // 4. 清理和验证
    title = title.replace(/^["']|["']$/g, ''); // 去除引号
    if (title.length > maxLength) {
      title = title.slice(0, maxLength) + '...';
    }
    
    return title || 'New Conversation';
  } catch (error) {
    console.error('Failed to generate title:', error);
    return 'New Conversation';
  }
}
```

## 4. Hooks 层设计

### 4.1 Chat Hooks 补丁

**文件**: `/src/hooks/use-chat.ts`

**新增 Hooks**:
```typescript
/**
 * Hook for deleting a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) =>
      internalApiService.deleteConversation(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook for updating a conversation
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      conversationId,
      title,
    }: {
      conversationId: string;
      title: string;
    }) => internalApiService.updateConversation(conversationId, { title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
```

**修改 `useChat`**:
```typescript
export function useChat(conversationId?: string) {
  // ... existing code ...
  
  // 添加 loadingMessages 状态
  const { data: dbMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      return internalApiService.getMessages(conversationId);
    },
    enabled: !!conversationId,
  });
  
  // 返回 loadingMessages
  return {
    messages,
    loadingMessages, // ← 新增
    sendMessage,
    status,
    error,
    setMessages,
  };
}
```

### 4.2 URL Query Hook

**文件**: `/src/hooks/use-chat-url-query.ts` (新建)

**实现**:
```typescript
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useChatUrlQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const conversationId = searchParams.get('convId') ?? undefined;
  
  const setConversationId = useCallback(
    (id: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set('convId', id);
      } else {
        params.delete('convId');
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  
  return { conversationId, setConversationId };
}
```

## 5. Internal API Service 补丁

**文件**: `/src/lib/internal-api/index.ts`

**新增方法**:
```typescript
/**
 * Delete a conversation
 */
async deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error || 'Failed to delete conversation');
  }
}

/**
 * Update a conversation
 */
async updateConversation(
  conversationId: string,
  updates: { title: string }
): Promise<Conversation> {
  const response = await fetch(`/api/chat/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error || 'Failed to update conversation');
  }
  
  return result.data;
}
```

## 6. 组件设计补丁

### 6.1 ChatModal 重构

**文件**: `/src/components/global/chat/chat-modal.tsx`

**主要变更**:
1. 使用 `useChatUrlQuery` hook 管理 URL query
2. 添加删除/重命名功能
3. 显示 loading 骨架屏
4. 调整用户消息右对齐

**伪代码结构**:
```tsx
export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  // 1. URL query 同步
  const { conversationId, setConversationId } = useChatUrlQuery();
  
  // 2. Conversations 列表
  const { conversations } = useConversations();
  
  // 3. Chat hook
  const { messages, loadingMessages, sendMessage } = useChat(conversationId);
  
  // 4. 删除/更新 mutations
  const { mutate: deleteConv } = useDeleteConversation();
  const { mutate: updateConv } = useUpdateConversation();
  
  // 5. 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // 6. 确认对话框
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  return (
    <Drawer.Root open={isOpen} /* ... */>
      {/* Sidebar: Conversation 列表 */}
      <ConversationList
        conversations={conversations}
        selectedId={conversationId}
        onSelect={setConversationId}
        onDelete={(id) => setDeleteConfirmId(id)}
        onEdit={(id, title) => { setEditingId(id); setEditTitle(title); }}
      />
      
      {/* Main: 消息区域 */}
      <MessageArea
        messages={messages}
        loading={loadingMessages}
        onSend={sendMessage}
      />
      
      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => deleteConv(deleteConfirmId!)}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </Drawer.Root>
  );
}
```

### 6.2 新增子组件

**ConversationListItem** (`conversation-list-item.tsx`):
- 显示标题 + 操作按钮
- 编辑态切换
- 悬停显示操作按钮

**DeleteConfirmDialog** (`delete-confirm-dialog.tsx`):
- Chakra AlertDialog
- 二次确认删除

**MessageSkeleton** (`message-skeleton.tsx`):
- Chakra Skeleton
- 骨架屏布局

## 7. 错误处理

### 7.1 API 错误

```typescript
try {
  await deleteConversation(id);
} catch (error) {
  toast({
    title: 'Failed to delete conversation',
    description: error.message,
    status: 'error',
  });
}
```

### 7.2 AI 生成标题失败

```typescript
try {
  const title = await generateConversationTitle(content);
  await updateConversation(convId, { title });
} catch (error) {
  console.error('Failed to generate title:', error);
  // 使用默认标题，不影响用户体验
}
```

## 8. 性能优化

### 8.1 防抖

- 编辑标题：300ms debounce

### 8.2 缓存

- TanStack Query 缓存 conversations 和 messages
- 删除/更新后 invalidate 缓存

### 8.3 异步

- AI 生成标题异步执行，不阻塞消息发送

## 9. 测试策略

### 9.1 单元测试

- `generateConversationTitle` 函数
- `chatService.updateConversation`
- `chatService.deleteConversation`

### 9.2 集成测试

- API 路由：PATCH/DELETE `/api/chat/conversations/[id]`
- Hooks：`useDeleteConversation`, `useUpdateConversation`

### 9.3 E2E 测试

- 删除 conversation 流程
- 重命名 conversation 流程
- URL query 同步

---

**设计完成时间**: 2026-02-03  
**设计人**: AI Assistant

