# NEO-LOG

> AI 驱动的个人生活追踪与分析系统

## 项目概述

- **名称**: NEO-LOG
- **定位**: AI 驱动的个人生活追踪与分析系统
- **核心价值**: 个性化、智能化、可视化
- **目标用户**: 希望追踪生活数据并获得智能洞察的个人用户

### 解决的痛点

1. 习惯/目标定义不够个性化，多场景需要多个 App
2. 可视化依赖用户自身分析能力
3. 未利用 AI 能力进行智能分析和建议

## 技术栈

- **框架**: Next.js (App Router)
- **UI**: React + Chakra UI
- **数据库**: PostgreSQL + Supabase
- **ORM**: Drizzle
- **数据获取**: TanStack Query (useQuery/useMutation)
- **状态管理**: Zustand
- **AI Flow**: LangChain + LangGraph
- **部署**: Vercel

### 国际化 (i18n)

- **是否需要**: 否
- **默认语言**: en (如需要)
- **支持语言**: ["en"] (如需要)

### 代码规范

- **TypeScript 严格模式**: 是
- **文件大小限制**: 300 行
- **禁用**: `as` / `!` / `any` / `export *`
- **ESLint & Prettier 配置一致性**: 是 (必须)
- **VSCode 自动格式化**: 是
- **测试覆盖要求**: 否

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
- **文件大小**: < 300 行，大文件拆分
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

## UI 配置

### 品牌

- **名称**: NEO-LOG
- **理念**: AI 原生的个人生活追踪系统，赛博朋克美学与实用主义结合
- **Slogan**: Log your life. Hack your future.
- **风格**: 赛博朋克 + 复古未来主义 + Matrix 数据流 + 科幻 HUD

### 配色

**主色**:
- 矩阵绿 `#00FF41` - 主强调、成功、AI响应
- 警报橙 `#FF6B35` - 次强调、警告、重要操作
- 电光蓝 `#00D4FF` - 链接、交互、信息提示

**语义色**: 成功 `#00FF41` | 警告 `#FFD700` | 错误 `#FF3366` | 信息 `#00D4FF`

### 字体

- **品牌/标题**: Press Start 2P (英文), Zpix (中文)
- **正文**: VT323 / IBM Plex Mono (英文), 思源黑体 (中文)
- **数据/代码**: JetBrains Mono

### 组件库

Chakra UI

