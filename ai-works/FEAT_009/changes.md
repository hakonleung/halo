# FEAT_009: 变更记录

## 变更概述

为 NEO-LOG 添加用户画像和情绪追踪功能，将 AI 定位为用户的"数字分身"。

## 架构变更

### 新增数据表 `neolog_user_profiles`

- `portrait` (JSONB): 用户画像 - 昵称、性格、兴趣、习惯、目标、沟通风格
- `recent_emotions` (JSONB): 最近 20 条情绪记录
- `recent_behaviors` (JSONB): 最近 20 条行为模式记录
- 每用户一条记录 (`user_id` UNIQUE)

### 新增 Profile Agent 流程

```
用户发送消息 → 主 Agent 基于画像回复 → onFinish 回调
                                          ↓
                                   Profile Agent (后台异步)
                                          ↓
                              分析对话 → 更新画像/情绪/行为
```

### System Prompt 拆分

从 `message/route.ts` 中的硬编码字符串拆分为独立模块 `system-prompt.ts`：
- 根据用户画像动态生成 system prompt
- 新用户：引导 AI 主动了解用户
- 老用户：注入画像/情绪/行为上下文

## 文件变更明细

### 新增文件

1. **`src/types/profile-server.ts`** - 类型定义
   - `UserProfileModel`: 数据库模型
   - `UserPortrait`: 用户画像结构
   - `EmotionEntry`: 情绪条目
   - `BehaviorSummary`: 行为模式摘要

2. **`src/lib/profile-service.ts`** - 服务层
   - `getProfile` / `createProfile` / `getOrCreateProfile`
   - `updatePortrait`: 合并更新画像
   - `addEmotions` / `addBehaviors`: 追加记录（保留最近 20 条）

3. **`src/lib/agents/system-prompt.ts`** - 系统提示词
   - `buildSystemPrompt(userId, profile)`: 基于画像构建提示词

4. **`src/lib/agents/profile-agent.ts`** - 画像分析 Agent
   - `runProfileAgent(llm, supabase, userId, userMessage, assistantMessage)`
   - 异步执行，不阻塞主对话流
   - 使用 LLM 分析对话内容，提取画像/情绪/行为更新

### 修改文件

5. **`src/db/schema.ts`** - 新增 `neologUserProfiles` 表定义
6. **`src/types/database.ts`** - 新增 `neolog_user_profiles` 类型映射
7. **`src/app/api/chat/message/route.ts`** - 集成变更：
   - 导入 `profileService`, `buildSystemPrompt`, `runProfileAgent`
   - 并行加载 LLM 和用户画像
   - 使用 `buildSystemPrompt` 替代硬编码提示词
   - 在 `onFinish` 中异步执行 `runProfileAgent`

## 验证结果

- `pnpm tsc --noEmit`: 无新增错误
- `pnpm lint`: 无新增错误
- DB migration: 已生成
