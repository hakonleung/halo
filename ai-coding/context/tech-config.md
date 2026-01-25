# 技术配置

> 项目特定的技术配置信息，供 04-技术设计 阶段引用。

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Next.js (App Router) |
| UI | React + Chakra UI |
| 数据库 | PostgreSQL + Supabase |
| ORM | Drizzle |
| 数据获取 | TanStack Query (useQuery/useMutation) |
| 状态管理 | Zustand |
| AI Flow | LangChain + LangGraph |
| 部署 | Vercel |

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

| 规则 | 说明 |
|------|------|
| 类型安全 | 严格 TS，禁用 `as`/`!`/`any`/`export *` |
| 文件大小 | < 300 行，大文件拆分 |
| 脚本 | `tsc --noEmit` + `lint --fix` 每次生成后运行 |
| 绕过 | 复杂类型用 `eslint-disable-next-line` 或 `@ts-expect-error` |

## 集成约定

| 类别 | 规则 |
|------|------|
| 安全 | 非对称加密处理密码，禁止泄漏敏感变量到 client |
| 前后端 | Client 禁止操作数据库，通过 API 交互 |
| 样式 | 使用 Chakra theme，不自定义 class，基础组件样式在 theme.components 定义 |
| 表单 | 使用第三方库（提供校验） |
| 数据获取 | 仅 TanStack Query (useQuery/useMutation)，禁止 SWR |
| 错误处理 | 完善的错误和 loading/pending 处理 |
| UI | 禁止使用原生 tag，使用 Chakra 组件 |
| 自动化 | 优先自动化（如 Drizzle 生成 SQL），避免硬编码 |

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
