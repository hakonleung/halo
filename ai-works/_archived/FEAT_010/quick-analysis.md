# FEAT_010: 简化 Chat 功能

## 需求分析

### 需求列表

1. **移除 title/删除/新建功能** - 不再需要管理多个对话，移除相关 UI 和 API
2. **每个用户只有一个 chat** - 修改逻辑确保每个用户只有一个 conversation，自动获取或创建
3. **只使用最近20条 history 作为 context** - 优化性能，限制上下文长度

### 修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/server/services/chat-service.ts` | 修改 | 添加 `getOrCreateConversation` 方法，确保每个用户只有一个 conversation；修改 `getMessages` 只返回最近20条 |
| `src/app/api/chat/message/route.ts` | 修改 | 移除 title 生成逻辑，使用 `getOrCreateConversation` |
| `src/app/api/chat/conversations/route.ts` | 修改 | 简化或删除，只保留获取单个 conversation 的逻辑 |
| `src/app/api/chat/conversations/[id]/route.ts` | 删除 | 不再需要更新/删除 conversation |
| `src/client/hooks/use-chat.ts` | 修改 | 移除 `useConversations`, `useDeleteConversation`, `useUpdateConversation`；简化 `useChat` 自动获取 conversation |
| `src/client/components/chat/index.tsx` | 修改 | 移除 conversation list、title 编辑、删除等 UI |
| `src/client/components/chat/conversation-list.tsx` | 删除 | 不再需要对话列表 |
| `src/client/components/chat/conversation-item.tsx` | 删除 | 不再需要对话项 |
| `src/client/internal-api/chat.ts` | 修改 | 移除 `getConversations`, `deleteConversation`, `updateConversation`；添加 `getOrCreateConversation` |
| `src/client/hooks/use-chat-url-query.ts` | 修改 | 简化，不再需要 conversationId 参数 |

