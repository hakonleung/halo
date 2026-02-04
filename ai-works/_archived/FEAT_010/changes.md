# FEAT_010: 简化 Chat 功能 - 修改记录

## 修改概述

简化 Chat 功能，移除多对话管理，改为每个用户只有一个 conversation，并限制上下文为最近 20 条消息。

## 修改文件清单

### 后端服务层

#### `src/server/services/chat-service.ts`
- ✅ 添加 `getOrCreateConversation` 方法：确保每个用户只有一个 conversation
- ✅ 修改 `getMessages` 方法：添加可选的 `count` 参数
  - 如果提供 `count`：返回最近 N 条消息（用于 context，限制 token 使用）
  - 如果不提供 `count`：返回所有消息（用于前端显示完整历史）
- ✅ 删除 `getMessagesForContext` 方法（功能合并到 `getMessages`）

#### `src/app/api/chat/message/route.ts`
- ✅ 移除 `generateConversationTitle` 导入和使用
- ✅ 移除 `conversationId` 参数要求
- ✅ 使用 `getOrCreateConversation` 自动获取或创建用户的 conversation
- ✅ 移除 title 生成逻辑
- ✅ 使用 `getMessages(..., 20)` 获取最近 20 条消息用于 context（限制 token 使用）
- ✅ 支持首次消息时自动生成欢迎消息：当 conversation 为空且 userText 为空时，允许触发 AI 自动回复

#### `src/app/api/chat/conversation/route.ts` (重命名自 `conversations`)
- ✅ 重命名为单数形式（`conversation`），反映每个用户只有一个 conversation
- ✅ 简化 GET 方法：改为调用 `getOrCreateConversation`，返回单个 conversation
- ✅ 删除 POST 方法（不再需要手动创建 conversation）

#### `src/app/api/chat/conversation/[id]/messages/route.ts` (重命名自 `conversations/[id]/messages`)
- ✅ 重命名为单数形式，与主 route 保持一致

### 前端 API 层

#### `src/client/internal-api/chat.ts`
- ✅ 移除 `getConversations` 方法
- ✅ 移除 `deleteConversation` 方法
- ✅ 移除 `updateConversation` 方法
- ✅ 添加 `getOrCreateConversation` 方法
- ✅ 更新 API 路径：`/api/chat/conversations` → `/api/chat/conversation`
- ✅ 更新 messages API 路径：`/api/chat/conversations/[id]/messages` → `/api/chat/conversation/[id]/messages`

#### `src/client/internal-api/index.ts`
- ✅ 更新导出：移除旧的 chat API 方法，添加 `getOrCreateConversation`

### 前端 Hooks

#### `src/client/components/chat/use-chat.ts` (原 `src/client/hooks/use-chat.ts`)
- ✅ 移除 `useConversations` hook
- ✅ 移除 `useDeleteConversation` hook
- ✅ 移除 `useUpdateConversation` hook
- ✅ 简化 `useChat` hook：
  - 自动获取或创建 conversation
  - 移除 `conversationId` 参数
  - 简化 transport 配置（不再需要传递 conversationId）
- ✅ 添加自动欢迎消息功能：当 conversation 为空时，自动发送空消息触发 AI 生成欢迎消息

#### `src/client/hooks/use-chat-url-query.ts`
- ✅ 删除整个文件（不再需要 URL 参数同步）

### 前端组件

#### `src/client/components/chat/index.tsx`
- ✅ 移除所有 conversation 列表相关逻辑
- ✅ 移除 title 编辑和删除功能
- ✅ 移除 `useConversations`, `useDeleteConversation`, `useUpdateConversation` hooks
- ✅ 移除 `useChatUrlQuery` hook
- ✅ 简化组件结构：移除侧边栏和移动端菜单
- ✅ 移除删除确认对话框

#### `src/client/components/chat/chat-header.tsx`
- ✅ 移除 `title` 和 `mobileMenuTrigger` props
- ✅ 使用固定的 "CHAT" 标题

#### `src/client/components/chat/conversation-list.tsx`
- ✅ 删除整个文件

#### `src/client/components/chat/conversation-item.tsx`
- ✅ 删除整个文件

## 功能变更

### 移除的功能
1. ❌ 多对话管理（每个用户只能有一个 conversation）
2. ❌ Conversation 标题编辑
3. ❌ Conversation 删除功能
4. ❌ Conversation 列表显示
5. ❌ 新建对话功能（自动创建）
6. ❌ URL 参数同步 conversation ID

### 新增/改进的功能
1. ✅ 自动获取或创建用户的唯一 conversation
2. ✅ 限制 context 为最近 20 条消息（提升性能，减少 token 使用）
   - 前端 `getMessages` API 调用时不传 `count`，返回所有消息（用于显示完整历史）
   - 后端 message route 调用 `getMessages(..., 20)` 只取最近 20 条用于 context
3. ✅ 简化的 UI（移除侧边栏和菜单）
4. ✅ 首次打开 chat 时自动生成欢迎消息
   - 当 conversation 为空时，前端自动发送空消息触发 AI 生成欢迎消息
   - AI 根据 system prompt 中的新用户逻辑生成个性化欢迎消息

## 数据库影响

- 无数据库 schema 变更
- `neolog_conversations` 表的 `title` 字段保留但不再使用
- 每个用户现在只应该有一个 conversation（通过应用逻辑保证）

## 验证

- ✅ TypeScript 类型检查通过 (`pnpm tsc --noEmit`)
- ✅ ESLint 检查通过 (`pnpm lint --fix`)
- ✅ 所有不再使用的文件已删除
- ✅ 所有引用已更新

