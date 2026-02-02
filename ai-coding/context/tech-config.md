# 技术配置

> 项目特定的技术配置信息，供 04-技术设计 阶段引用。

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
│   └── [pages]/           # 页面组件
├── components/            # React 组件
├── db/                    # 数据库 Schema (Drizzle)
├── hooks/                 # 自定义 Hooks
├── lib/                   # 服务层 (Service Class)
├── store/                 # Zustand Store
├── types/                 # TypeScript 类型
│   ├── *-client.ts       # 前端类型
│   └── *-server.ts       # 后端类型
├── utils/                 # 工具函数
└── styles/                # Chakra Theme 配置
```

## 架构约定

| 层次 | 模式 | 路径 |
|------|------|------|
| API | Route Handlers | `src/app/api/[resource]/route.ts` |
| 服务 | Service Class | `src/lib/[resource]-service.ts` |
| Hooks | TanStack Query | `src/hooks/use-[resource].ts` |
| 类型 | Client/Server 分离 | `src/types/[resource]-*.ts` |

## 代码质量

- **类型安全**: 严格 TS，禁用 `as`/`!`/`any`/`export *`
- **类型定义**: 优先使用 enum 替代字符串字面量联合类型，提升类型安全性和可维护性
- **配置对象类型**: 使用 `Record<EnumType, ValueType>` 类型定义配置对象，确保类型安全
- **文件大小**: < 300 行，大文件拆分（如 dashboard-service.ts 超过 300 行应拆分）
- **脚本**: `tsc --noEmit` + `lint --fix` 每次生成后运行
- **绕过**: 复杂类型用 `eslint-disable-next-line` 或 `@ts-expect-error`

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

- RESTful: `/api/[resource]` (列表/创建), `/api/[resource]/[id]` (详情/更新/删除)
- 响应: `{ data: T }` | `{ data: T[], pagination }` | `{ error: string }`

## 数据库约定

- 主键: `id` (UUID), 外键: `userId`
- 时间戳: `createdAt`, `updatedAt`
- 使用 Drizzle schema 定义，`drizzle-kit` 生成迁移

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
