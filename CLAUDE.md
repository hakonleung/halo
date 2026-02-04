# NEO-LOG 项目配置

> AI 原生的个人生活追踪系统

## 项目概述

- **名称**: NEO-LOG
- **定位**: AI 驱动的个人生活追踪与分析系统
- **核心价值**: 个性化、智能化、可视化
- **目标用户**: 希望追踪生活数据并获得智能洞察的个人用户

## 技术栈

- **框架**: Next.js (App Router)
- **UI**: React + Chakra UI
- **数据库**: PostgreSQL + Supabase
- **ORM**: Drizzle
- **数据获取**: TanStack Query (useQuery/useMutation)
- **状态管理**: Zustand
- **AI Flow**: LangChain + LangGraph
- **部署**: Vercel

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由 (Route Handlers)
│   │   ├── auth/          # 认证相关 API
│   │   ├── behaviors/     # 行为记录 API
│   │   ├── chat/          # Chat API (单对话模式)
│   │   ├── dashboard/     # 仪表盘 API
│   │   ├── goals/         # 目标 API
│   │   ├── notes/         # 笔记 API
│   │   └── settings/      # 设置 API
│   └── [pages]/           # 页面组件
├── client/                 # 前端代码
│   ├── components/         # React 组件
│   │   ├── actions/       # 操作抽屉组件
│   │   ├── auth/          # 认证组件
│   │   ├── chat/          # Chat 组件
│   │   ├── dashboard/     # 仪表盘组件
│   │   ├── editor/        # 编辑器组件
│   │   ├── layout/        # 布局组件
│   │   ├── log/           # 历史记录组件
│   │   ├── settings/      # 设置组件
│   │   └── shared/        # 共享组件
│   ├── hooks/             # 自定义 Hooks
│   ├── internal-api/      # 前端 API 调用层
│   ├── store/             # Zustand Store
│   ├── types/             # 前端 TypeScript 类型 (*-client.ts)
│   ├── theme/             # Chakra Theme 配置
│   └── utils/             # 前端工具函数
└── server/                 # 后端代码
    ├── agents/            # AI Agents (LangChain)
    ├── db/                # 数据库 Schema (Drizzle)
    ├── services/          # 服务层 (Service Class)
    ├── types/             # 后端 TypeScript 类型 (*-server.ts)
    └── utils/             # 后端工具函数
```

## 架构约定

| 层次 | 模式 | 路径 |
|------|------|------|
| API | Route Handlers | `src/app/api/[resource]/route.ts` |
| 服务 | Service Class | `src/server/services/[resource]-service.ts` |
| Hooks | TanStack Query | `src/client/hooks/use-[resource].ts` |
| 类型 | Client/Server 分离 | `src/client/types/[resource]-client.ts`<br>`src/server/types/[resource]-server.ts` |
| 组件 | React Components | `src/client/components/[module]/` |
| 数据库 | Drizzle Schema | `src/server/db/schema.ts` |

## 代码质量

- **类型安全**: 严格 TS，禁用 `as`/`!`/`any`/`export *`
- **类型定义**: 优先使用 enum 替代字符串字面量联合类型，提升类型安全性和可维护性
- **配置对象类型**: 使用 `Record<EnumType, ValueType>` 类型定义配置对象，确保类型安全
- **文件大小**: < 300 行，大文件拆分（如 dashboard-service.ts 超过 300 行应拆分）。如果文件略超限制（如 350 行），应在后续迭代中优先拆分
- **脚本**: `tsc --noEmit` + `lint --fix` 每次生成后运行
- **绕过**: 复杂类型用 `eslint-disable-next-line` 或 `@ts-expect-error`
- **代码复用**: 识别重复代码模式，提取共享组件或工具函数，提升可维护性

## 集成约定

- **安全**: 非对称加密处理密码，禁止泄漏敏感变量到 client
- **前后端**: Client 禁止操作数据库，通过 API 交互
- **样式**: 使用 Chakra theme，不自定义 class，基础组件样式在 theme.components 定义
- **表单**: 使用第三方库（提供校验）
- **数据获取**: 仅 TanStack Query (useQuery/useMutation)，禁止 SWR
- **错误处理**: 完善的错误和 loading/pending 处理
- **UI**: 禁止使用原生 tag，使用 Chakra 组件
- **自动化**: 优先自动化（如 Drizzle 生成 SQL），避免硬编码

## 类型约定

**服务端** (`*-server.ts`): `XxxModel`, `CreateXxxRequest`, `UpdateXxxRequest`, `GetXxxListParams`

**客户端** (`*-client.ts`): `Xxx` (Date→string), `XxxFormData`, `XxxListResponse`

## API 约定

- **RESTful**: `/api/[resource]` (列表/创建), `/api/[resource]/[id]` (详情/更新/删除)
- **Chat API**: `/api/chat/conversation` (单对话模式，每个用户只有一个 conversation), `/api/chat/message` (发送消息)
- **API 路径命名**: 单数资源使用单数路径（如 `/api/chat/conversation`），复数资源使用复数路径（如 `/api/behaviors`）
- **响应格式统一**: 所有 API 使用统一的响应格式 `{ data: T | null, error: string | null }`，确保前端处理逻辑一致
- **鉴权处理**: 使用 `createApiHandler` 辅助函数统一处理鉴权逻辑，避免重复代码
- **错误处理**: 统一的错误处理逻辑，返回清晰的错误信息
- **状态码语义化**: 使用语义化的 HTTP 状态码（200 成功、201 创建、400 请求错误、401 鉴权失败、404 未找到、500 服务器错误等）
- **特殊 API**: 对于特殊需求（流式响应、cookie），保持原样，不强行统一
- **性能优化**: 对于需要限制上下文长度的场景（如 Chat），后端只使用最近 N 条记录作为 context，前端仍可获取完整历史用于显示

## 数据库约定

- 主键: `id` (UUID), 外键: `userId`
- 时间戳: `createdAt`, `updatedAt`
- 使用 Drizzle schema 定义，`drizzle-kit` 生成迁移
- **JSONB 字段**: 利用 PostgreSQL JSONB 字段存储灵活配置（如用户画像、情绪记录），无需频繁迁移数据库
- **最近 N 条记录模式**: 对于需要维护最近 N 条记录的字段（如最近 20 条情绪），使用 JSONB 数组，在添加新记录时自动截断到 N 条

## 测试约定

- 不覆盖第三方包
- 单元测试覆盖工具函数
- 测试精简，显而易见的场景不测

## 状态管理约定

- **全局状态**: 使用 Zustand store，避免 Context Provider 嵌套
- **URL 状态同步**: 使用自定义 hook 同步 URL query 参数到 store
- **查询刷新**: 数据变更后使用 TanStack Query 的 `invalidate` 刷新相关查询

## 组件设计约定

- **通用组件**: 抽取可复用的通用组件（如 ConfirmDialog、FilterBar），提升代码复用性
- **全局组件**: 使用统一的 GlobalComponents 入口管理全局组件
- **详情抽屉**: 使用全局 Detail Drawers 组件，通过 URL query 参数控制显示
- **表单组件**: 统一放在 `components/forms` 目录，支持 create/edit 模式

## 时区处理约定

- **后端**: 返回原始数据，不进行时区转换
- **前端**: 根据用户时区进行数据划分和处理
- **API**: 获取用户时区并传递给前端

## UI 可访问性约定

- **文字对比度**: 确保所有文字颜色符合 WCAG AA 对比度标准（正常文字 ≥ 4.5:1，大文字 ≥ 3:1）
- **输入框**: 使用 Chakra Input 组件，配置 placeholder 颜色和样式
- **确认对话框**: 使用 Chakra 组件替代原生 confirm，提供更好的可访问性

## 样式系统约定

- **Slot Recipe**: 对于 Chakra UI 官方组件，使用 `anatomy.keys()` 替代硬编码 slots 数组，提升类型安全性和可维护性。自定义组件可以保持硬编码 slots
- **统一组件高度**: 在 FilterBar 等组合组件中，统一所有 input 和 select 使用相同的高度，保持视觉一致性
- **Size Variants**: 为组件添加 size variants 支持（sm, md, lg），确保不同场景下的尺寸一致性

## 功能开关约定

- **Feature Flag 模块**: 使用 enum 类型定义功能标识，配置对象使用 `Record<FeatureFlag, boolean>` 类型，确保类型安全
- **性能优化**: 在组件中使用 `useMemo` 缓存基于 feature flag 的计算结果，使用 `useEffect` 处理状态切换逻辑

## AI Agent 设计约定

- **System Prompt 管理**: System Prompt 应独立为模块（如 `system-prompt.ts`），避免在 API route 中硬编码，支持动态生成
- **后台异步处理**: 对于不阻塞主流程的 AI 分析任务（如用户画像更新），使用后台异步处理，在 `onFinish` 回调中触发
- **Agent 模块化**: 每个 Agent 应独立为模块，职责单一，便于测试和维护
- **异步操作不阻塞**: AI 生成标题等辅助功能应异步执行，不阻塞主要业务流程

## 重构最佳实践

- **高阶函数模式**: 使用高阶函数（HOF）封装通用逻辑，避免重复代码（如 `createApiHandler`）
- **泛型设计**: 使用 TypeScript 泛型确保类型安全，同时保持灵活性
- **渐进式重构**: 先重构简单的部分，再重构复杂的，逐步验证，避免一次性改动过大
- **特殊情况处理**: 对于特殊需求（流式响应、cookie 等），保持原样，不强行统一
- **避免过度抽象**: 只抽象真正重复的逻辑，不强行统一特殊情况
- **避免破坏性变更**: 重构时确保兼容现有代码，响应格式变更需确保客户端兼容

## 数据结构设计约定

- **统一管理**: 使用统一的数据结构（如数组）管理相关配置，避免字段分散
- **扩展现有结构**: 扩展现有数据结构而非添加新字段，保持数据结构简洁和一致性
- **JSONB 灵活性**: 利用 PostgreSQL JSONB 字段存储灵活配置，无需频繁迁移数据库

## 第三方库集成约定

- **LangChain 配置**: 所有 LLM Provider 都支持 `configuration.baseURL` 参数，可自定义 API 端点
- **兼容格式**: Custom provider 使用 OpenAI 兼容的 API 格式（ChatOpenAI），确保通用性

## UI 设计规范

### 品牌

- **名称**: NEO-LOG
- **理念**: AI 原生的个人生活追踪系统，赛博朋克美学与实用主义结合
- **Slogan**: Log your life. Hack your future.
- **风格**: 赛博朋克 + 复古未来主义 + Matrix 数据流 + 科幻 HUD

### 配色

**主色**:
- 矩阵绿: `#00FF41` - 主强调、成功、AI响应
- 警报橙: `#FF6B35` - 次强调、警告、重要操作
- 电光蓝: `#00D4FF` - 链接、交互、信息提示

**背景色**:
- 深空黑: `#0A0A0A` - 主背景
- 碳灰: `#1A1A1A` - 卡片/容器
- 暗灰: `#2A2A2A` - 悬停、次级容器

**文字色**:
- 荧光白: `#E0E0E0` - 主文字
- 灰雾: `#888888` - 次要文字、占位符
- 暗淡灰: `#555555` - 禁用状态

### 字体

| 用途 | 英文 | 中文 | 备选 |
|------|------|------|------|
| 品牌/标题 | Press Start 2P | Zpix | Silkscreen |
| 正文 | VT323 / IBM Plex Mono | 思源黑体 | Fira Code |
| 数据/代码 | JetBrains Mono | - | Fira Code |

### 组件规范

- **默认圆角**: 4px
- **边框样式**: 1px solid, 带故障动画
- **卡片**: 背景 `#1A1A1A`, 边框 `1px solid rgba(0, 255, 65, 0.3)`, 发光 `box-shadow: 0 0 15px rgba(0, 255, 65, 0.1)`
- **按钮**: Primary 渐变背景, Secondary 透明背景+矩阵绿边框, Danger 透明背景+霓虹红边框
- **输入框**: 背景 `#0A0A0A`, 边框 `1px solid #2A2A2A`, 聚焦边框 `#00FF41` + 外发光

### 响应式

| 断点 | 范围 | 布局 |
|------|------|------|
| Mobile | < 640px | 底部Tab + 单列 |
| Tablet | 640-1024px | 顶部导航 + 双列 |
| Desktop | > 1024px | 顶部导航 + 多列网格 |

## 工作流

本项目使用 AI Coding 工作流管理开发流程，相关文档位于 `ai-coding/` 目录。

### 重要提示

在执行任何工作流命令前，必须先读取完整的详细说明文件：
- `ai-coding/action-[name].md`

该文件包含完整的执行流程、详细步骤、输出格式等所有必要信息。请先读取该文件，然后按照其中的详细说明执行。

