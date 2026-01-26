# tech-config.md 默认配置

## 默认值

### 国际化 (i18n)
- 是否需要: 否
- 默认语言: en (如需要)
- 支持语言: ["en"] (如需要)

### 代码规范
- TypeScript 严格模式: 是
- 文件大小限制: 300 行
- 禁用: `as` / `!` / `any` / `export *`
- ESLint & Prettier 配置一致性: 是 (必须)
- VSCode 自动格式化: 是
- 测试覆盖要求: 否

### 项目结构
```
src/
├── app/        # 框架路由
├── components/  # 组件
├── db/         # 数据库 Schema
├── hooks/      # Hooks
├── lib/        # 服务层
├── store/      # 状态管理
├── types/      # 类型
├── utils/      # 工具
└── styles/     # 样式
```

### 约定
- **类型**: 服务端 `*-server.ts` (XxxModel, CreateXxxRequest...), 客户端 `*-client.ts` (Xxx, XxxFormData...)
- **API**: RESTful `/api/[resource]`, 响应 `{ data: T }` | `{ data: T[], pagination }` | `{ error: string }`
- **数据库**: 主键 `id` (UUID), 外键 `userId`, 时间戳 `createdAt`, `updatedAt`
- **代码质量**: 严格 TS, 文件 < 300 行, `tsc --noEmit` + `lint --fix`
- **集成**: 安全加密, Client 不操作数据库, 使用主题系统, 表单校验, 完善错误处理
