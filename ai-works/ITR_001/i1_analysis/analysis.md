# ITR_001: Chat 功能增强 - 增量需求分析

> 迭代类型: 功能增强 | 基准: Chat 基础功能 | 创建时间: 2026-02-03

## 1. 迭代需求概述

### 1.1 需求来源

用户提出的 Chat 功能改进需求，涉及 conversation 管理、消息加载、标题生成和 UI 优化。

### 1.2 需求清单

| ID | 需求描述 | 类型 | 优先级 |
|---|---|---|---|
| ITR-001 | 支持删除 conversation，需用户确认 | 新增 | P0 |
| ITR-002 | 支持重命名标题，点击 edit icon 变成 input 框 | 新增 | P0 |
| ITR-003 | 点击 conversation 时加载消息（loading 状态 + 渲染） | 修改 | P0 |
| ITR-004 | 新建 chat 时服务端使用 AI 生成标题 | 新增 | P0 |
| ITR-005 | 新建 chat 时前端同步 conversation ID | 修改 | P0 |
| ITR-006 | 当前 conversation ID 放到 URL query | 新增 | P0 |
| ITR-007 | 用户头像和消息渲染在右侧 | 修改 | P1 |

## 2. 变更类型分析

### 2.1 新增功能

**ITR-001: 删除 Conversation**
- 新增删除 API 端点（已有 `chatService.deleteConversation`）
- 新增前端删除 Hook/Mutation
- 新增删除确认对话框
- 需求确认交互（Chakra AlertDialog）

**ITR-002: 重命名 Conversation**
- 新增更新 conversation 标题的 API 端点
- 新增前端更新 Hook/Mutation
- 编辑态 UI（点击 icon → input 框）
- 内联编辑交互

**ITR-004: AI 生成标题**
- 基于首条用户消息内容，使用 LLM 生成简洁标题
- 在首次发送消息后触发
- 需集成 AI Agent 服务

**ITR-006: URL Query 同步**
- 使用 URL query parameter 存储当前 conversation ID
- 支持通过 URL 直接打开指定对话
- 前进/后退按钮支持

### 2.2 修改功能

**ITR-003: 优化消息加载**
- 当前问题：点击 conversation 时未加载/渲染消息
- 改进：添加 loading 状态，确保消息正确加载和渲染
- 需检查 `useChat` hook 的数据同步逻辑

**ITR-005: 前端同步 ID**
- 当前问题：新建 chat 后前端未同步 conversation ID
- 改进：创建后立即同步 ID 到前端状态
- 确保后续消息发送到正确的 conversation

**ITR-007: 用户消息右对齐**
- 调整消息布局，用户消息 + 头像显示在右侧
- Assistant 消息保持左侧
- 类似主流聊天应用的 UI 模式

### 2.3 删除功能

无删除功能。

## 3. 影响范围分析

### 3.1 前端影响

**组件层**
- `/src/components/global/chat/chat-modal.tsx`
  - 添加删除按钮 + 确认对话框
  - 添加编辑标题功能（内联 input）
  - 调整消息布局（用户消息右对齐）
  - 添加 loading 状态显示
  - 同步 URL query

**Hooks 层**
- `/src/hooks/use-chat.ts`
  - 新增 `useDeleteConversation` mutation
  - 新增 `useUpdateConversation` mutation
  - 优化 `useChat` 消息加载逻辑
  - 添加 URL query 同步

**Store 层**
- 无需新增 Store（使用 TanStack Query 管理状态）

### 3.2 后端影响

**API 层**
- 新增 `PATCH /api/chat/conversations/[id]`（更新标题）
- 已有 `DELETE /api/chat/conversations/[id]`（可能需实现）
- 修改 `POST /api/chat/message`（首次消息触发 AI 生成标题）

**Service 层**
- `/src/lib/chat-service.ts`
  - 新增 `updateConversation(supabase, userId, conversationId, { title })`
  - 验证 `deleteConversation` 是否已实现
- `/src/lib/agents/`
  - 新增 `generateConversationTitle(messageContent: string)` 函数

**数据库层**
- Schema：无需修改（`neologConversations.title` 已存在）
- 迁移：无需新增

### 3.3 类型影响

**Server 类型** (`/src/types/chat-server.ts`)
- 新增 `UpdateConversationRequest`

**Client 类型** (`/src/types/chat-client.ts`)
- 无需新增（复用现有类型）

### 3.4 依赖影响

**新增依赖**
- 无需新增 npm 包

**现有依赖**
- Chakra UI Dialog（确认对话框）
- TanStack Query（mutations）
- Next.js router（URL query）

## 4. 技术难点与风险

### 4.1 技术难点

| 难点 | 说明 | 解决方案 |
|---|---|---|
| URL query 同步 | 需要双向绑定 URL 和 state | 使用自定义 hook `useUrlQuery` |
| AI 标题生成时机 | 何时触发？如何避免重复生成？ | 检测 conversation 的 message count，首次消息后生成 |
| 内联编辑 UX | 编辑态切换、焦点管理、保存/取消 | 参考 Notion/Figma 内联编辑模式 |
| Loading 状态管理 | 切换 conversation 时的 loading 状态 | 利用 TanStack Query 的 `isLoading` |

### 4.2 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|---|---|---|---|
| 删除操作误触 | 数据丢失 | 中 | 必须二次确认（AlertDialog） |
| AI 生成标题失败 | 标题为空 | 低 | Fallback 到默认标题 |
| URL query 冲突 | 路由状态不一致 | 低 | 使用唯一 query key（如 `convId`） |
| 消息加载延迟 | 用户体验差 | 中 | 显示 loading 骨架屏 |

## 5. 验收标准

### 5.1 功能验收

- [ ] 点击删除按钮后弹出确认对话框，确认后成功删除 conversation
- [ ] 点击编辑图标后标题变为 input 框，支持编辑并保存
- [ ] 点击 conversation 后显示 loading 状态，消息正确加载和渲染
- [ ] 新建 chat 并发送首条消息后，标题由 AI 自动生成
- [ ] 新建 chat 后前端同步 conversation ID，后续消息发送正确
- [ ] 当前 conversation ID 显示在 URL query，刷新页面后保持选中状态
- [ ] 用户消息和头像显示在右侧，assistant 消息在左侧

### 5.2 性能验收

- 删除操作响应时间 < 500ms
- 标题更新响应时间 < 300ms
- AI 生成标题时间 < 3s
- 消息加载时间 < 1s

### 5.3 质量验收

- TypeScript 编译 0 错误
- ESLint 检查 0 错误
- 所有文件 < 300 行
- 代码覆盖率 ≥ 80%（关键逻辑）

## 6. 实现策略

### 6.1 实现顺序

**Phase 1: 基础功能（P0）**
1. ITR-006: URL query 同步（基础设施）
2. ITR-005: 前端同步 ID（修复现有问题）
3. ITR-003: 消息加载优化（修复现有问题）

**Phase 2: CRUD 功能（P0）**
4. ITR-001: 删除 conversation
5. ITR-002: 重命名标题

**Phase 3: AI 增强（P0）**
6. ITR-004: AI 生成标题

**Phase 4: UI 优化（P1）**
7. ITR-007: 用户消息右对齐

### 6.2 兼容性策略

- 保持现有 API 接口不变，仅新增端点
- 数据库 Schema 无需修改
- 向后兼容旧版 URL（无 query 时默认无选中）

### 6.3 回滚策略

- 新增功能通过 Feature Flag 控制
- 数据库无破坏性变更，可安全回滚代码

## 7. 下一步

### 7.1 待确认问题

- [ ] AI 生成标题的提示词模板（需要多语言支持吗？）
- [ ] 删除 conversation 后是否需要删除关联的 messages？（当前 Schema 有 `onDelete: 'cascade'`，会自动删除）
- [ ] URL query 的 key 名称确认（建议 `convId`）

### 7.2 设计阶段输出

下一阶段（I2）将输出：
- PRD 补丁：详细功能描述和交互流程
- UI 设计补丁：编辑态、确认对话框、loading 状态的视觉设计
- 技术设计补丁：API 规范、数据流、组件结构

---

**分析完成时间**: 2026-02-03  
**分析人**: AI Assistant  
**下一阶段**: I2 增量设计

