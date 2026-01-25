# NEO-LOG 项目进度记录

## 1. 已完成模块

### 1.1 用户配置模块 (User Configuration Module)
- **数据库**: 定义了 `neolog_user_settings` 表，包含个人资料、外观、通知、语言地区及 AI 设置。
- **后端**: 实现了 `settings-service.ts` 及 `/api/settings` 路由。
- **前端**:
  - 实现了 `Profile`、`Appearance`、`Notification`、`Locale` 四个设置子页面。
  - 使用 Chakra UI v3 组件（`FieldRoot`、`Select`、`Input` 等）重构。
  - 采用 React Query 进行数据获取与更新，移除 Zustand store。
  - 完善了主题系统，支持自定义 variant。

### 1.2 行为模块 (Behavior Module)
- **数据库**: 定义了 `neolog_behavior_definitions` 和 `neolog_behavior_records` 表。
- **后端**: 实现了 `behavior-service.ts` 及 `/api/behaviors/*` 路由。
- **前端**:
  - 实现了 `RecordForm`，支持根据 `metadata_schema` 动态生成表单字段。
  - 实现了 `ActionButton` (FAB) 用于快速触发记录。
  - 采用 React Query 管理行为定义和记录。

### 1.3 聊天机器人模块 (Chatbot Module)
- **数据库**: 定义了 `neolog_conversations` 和 `neolog_messages` 表。
- **后端**:
  - 实现了 `chat-service.ts`。
  - 集成 LangChain/LangGraph 逻辑，支持多提供商（OpenAI, Anthropic, Google）。
  - 实现了 SSE 流式响应接口 `/api/chat/message`。
  - 定义了 AI Agent 工具（记录行为、查询记录等）。
- **前端**:
  - 实现了赛博朋克风格的聊天界面。
  - 支持会话列表切换及流式文字输出。

### 1.4 历史记录模块 (History Module)
- **数据库**: 定义了 `neolog_notes` 表；`neolog_goals` 表已存在。
- **后端**:
  - 实现了 `note-service.ts` 和 `history-service.ts`（统一历史聚合服务）。
  - 实现了 `/api/history` 统一查询接口及 `/api/notes` CRUD 接口。
- **前端**:
  - 实现了 `/history` 页面。
  - 提供 `HistoryFilters`（类型、搜索、日期筛选）及 `HistoryList`（统一展示表格）。
  - 集成 `useHistory` 和 `useNotes` hooks。

## 2. 技术规范与架构优化

### 2.1 数据库架构
- **表名前缀**: 所有表名均添加了 `neolog_` 前缀。
- **Drizzle ORM**: 集成 Drizzle ORM 作为 Entity 的单一事实来源。
- **自动生成**: 实现了 `pnpm db:generate` 脚本，可根据 TypeScript 定义自动生成 `schema.sql` 和数据库类型。
- **Supabase**: 统一使用服务器端客户端工厂（`getSupabaseClient`），并附带完整的 `Database` 类型定义。

### 2.2 前端规范
- **Chakra UI v3**: 全面采用 Chakra UI v3 及其 Recipe API 进行样式管理。
- **类型安全**: 
  - 移除绝大部分 `any` 和 `!`。
  - 实现了 `MetadataField` 的联合类型。
  - 使用 `@chakra-ui/cli typegen` 生成样式类型。
- **状态管理**: 采用 TanStack Query 代替 Zustand 维护远程数据状态。

### 2.3 环境变量
- **静态访问**: `process.env` 访问方式已调整为静态，确保打包时能够正确注入。

## 3. 待办任务 (Next Steps)

- [ ] **可视化模块 (Visualization Module)**: 实现 Dashboard 核心图表（趋势、热力图、目标进度）。
- [ ] **目标管理 (Goal Management)**: 完善目标的详情查看及编辑功能（目前仅有基础服务和列表显示）。
- [ ] **动画增强**: 根据 PRD 进一步完善赛博朋克风格的故障效果、矩阵雨等特效。
- [ ] **数据导入导出**: 实现设置中的数据管理功能。

---
*更新日期: 2026-01-24*

