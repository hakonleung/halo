# CLAUDE.md

> NEO-LOG - AI 原生的个人生活追踪系统

## 项目概述

| 属性 | 值 |
|------|-----|
| 名称 | NEO-LOG |
| 定位 | AI 驱动的个人生活追踪与分析系统 |
| 风格 | 赛博朋克 + 复古未来主义 + Matrix 数据流 |

## ARC 工作流

本项目使用 **ARC (Audit-Revert-Code)** 工作流进行 AI 辅助开发。

### 核心指令

```
# 初始化（二选一）
/flow-create          # 新建项目
/flow-init            # 初始化已有项目

# 工作流（按需选择）
/flow-start [需求]    # 完整模式（7阶段）
/flow-quick [需求]    # 轻量模式（3阶段）
/flow-iterate [PRD]   # 迭代已有功能
/flow-refactor [范围] # 纯技术重构

# 状态管理
/flow-status          # 查看当前状态
/flow-list            # 列出所有工作流
/flow-continue        # 从快照恢复
/flow-sync-check      # 检查文档代码同步
```

### 完整模式（7阶段）

```
01-需求澄清 → 02-PRD → 03-UI设计 → 04-技术设计 → 05-实现 → 06-验证 → 07-部署
```

高风险阶段（01、04、06、07）需人类审核确认。

### 用户响应格式

| 响应 | 说明 |
|------|------|
| `确认` / `通过` | 进入下一步 |
| `修改 [内容]` | 修改指定内容 |
| `返工: [原因]` | 当前阶段返工 |
| `回退到 [阶段]` | 回退到指定阶段 |
| `跳过` | 使用默认值跳过 |

### 工作流文档

详见 `ai-coding/` 目录：
- `action.md` - 指令中心
- `action-work.md` - 完整工作流
- `action-quick.md` - 轻量工作流
- `workflow/` - 各阶段详细定义

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Next.js (App Router) |
| UI | React + Chakra UI |
| 数据库 | PostgreSQL + Supabase |
| ORM | Drizzle |
| 数据获取 | TanStack Query |
| 状态管理 | Zustand |
| AI | LangChain + LangGraph |
| 部署 | Vercel |

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Route Handlers
│   └── [pages]/           # 页面
├── components/            # React 组件
├── db/                    # Drizzle Schema
├── hooks/                 # 自定义 Hooks
├── lib/                   # Service 层
├── store/                 # Zustand Store
├── types/                 # TypeScript 类型
│   ├── *-client.ts       # 前端类型
│   └── *-server.ts       # 后端类型
├── utils/                 # 工具函数
└── styles/                # Chakra Theme
```

## 代码规范

### 架构约定

| 层次 | 模式 | 路径 |
|------|------|------|
| API | Route Handlers | `src/app/api/[resource]/route.ts` |
| 服务 | Service Class | `src/lib/[resource]-service.ts` |
| Hooks | TanStack Query | `src/hooks/use-[resource].ts` |
| 类型 | Client/Server 分离 | `src/types/[resource]-*.ts` |

### 必须遵守

- **类型安全**: 严格 TS，禁用 `as` / `!` / `any` / `export *`
- **文件大小**: < 300 行，超过需拆分
- **每次生成后**: 运行 `tsc --noEmit` + `lint --fix`
- **禁止**: 原生 HTML 标签，必须用 Chakra 组件
- **禁止**: SWR，仅用 TanStack Query
- **安全**: 密码非对称加密，敏感变量不暴露给 client

### 类型命名

**服务端** (`*-server.ts`):
- `XxxModel`, `CreateXxxRequest`, `UpdateXxxRequest`, `GetXxxListParams`

**客户端** (`*-client.ts`):
- `Xxx` (Date→string), `XxxFormData`, `XxxListResponse`

### API 约定

- RESTful: `/api/[resource]`（列表/创建）, `/api/[resource]/[id]`（详情/更新/删除）
- 响应格式: `{ data: T }` | `{ data: T[], pagination }` | `{ error: string }`

### 数据库约定

- 主键: `id` (UUID)
- 外键: `userId`
- 时间戳: `createdAt`, `updatedAt`
- 使用 Drizzle schema，`drizzle-kit` 生成迁移

---

## UI 规范

### 配色

| 类型 | 名称 | 色值 |
|------|------|------|
| 主色 | 矩阵绿 | `#00FF41` |
| 次强调 | 警报橙 | `#FF6B35` |
| 链接 | 电光蓝 | `#00D4FF` |
| 背景 | 深空黑 | `#0A0A0A` |
| 卡片 | 碳灰 | `#1A1A1A` |
| 文字 | 荧光白 | `#E0E0E0` |

### 图标

- 库: Phosphor Icons (Fill风格)，备选 Lucide
- 发光效果: `filter: drop-shadow(0 0 4px currentColor)`

### 响应式断点

| 断点 | 范围 | 布局 |
|------|------|------|
| Mobile | < 640px | 底部Tab + 单列 |
| Tablet | 640-1024px | 顶部导航 + 双列 |
| Desktop | > 1024px | 顶部导航 + 多列网格 |

---

## 常用命令

```bash
# 开发
pnpm dev

# 代码检查
pnpm lint --fix
pnpm tsc --noEmit

# 测试
pnpm test

# 数据库
pnpm db:generate   # 生成迁移
pnpm db:migrate    # 执行迁移
pnpm db:studio     # 打开 Drizzle Studio
```

## 质量门禁

工作流执行时自动检查：
- `pnpm test && pnpm lint && pnpm tsc --noEmit` 无错误
- 无新增 TODO/FIXME 注释
- 文档-代码同步率: 05阶段≥90%, 06阶段≥95%, 07阶段100%
