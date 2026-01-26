# tech-config.md 询问清单

## 问题列表

1. **前端框架**
   - [ ] Next.js (App Router) | [ ] Next.js (Pages Router) | [ ] React + Vite | [ ] Vue + Nuxt | [ ] 其他
   - → `技术栈.框架`

2. **数据库**
   - [ ] PostgreSQL + Supabase | [ ] PostgreSQL + 自建 | [ ] MySQL | [ ] MongoDB | [ ] SQLite | [ ] 其他
   - → `技术栈.数据库`

3. **ORM**
   - [ ] Drizzle | [ ] Prisma | [ ] TypeORM | [ ] 无 ORM
   - → `技术栈.ORM`

4. **数据获取**
   - [ ] TanStack Query | [ ] 原生 fetch | [ ] 其他
   - → `技术栈.数据获取`

5. **状态管理**
   - [ ] Zustand | [ ] Jotai | [ ] Redux Toolkit | [ ] Context API | [ ] 无需全局状态
   - → `技术栈.状态管理`

6. **AI 集成**
   - [ ] LangChain + LangGraph | [ ] Vercel AI SDK | [ ] 直接调用 API | [ ] 不需要 AI
   - → `技术栈.AI集成` (如不需要则不显示)

7. **国际化 (i18n)**
   - 是否需要？[是/否，默认: 否] → `国际化.是否需要`
   - 默认语言？[如 en, zh-CN，默认: en] (如需要) → `国际化.默认语言`
   - 支持语言？[如 ["en", "zh-CN"]] (如需要) → `国际化.支持语言`
   - i18n 库？[如 next-intl, react-i18next] (如需要) → `国际化.i18n库`

8. **代码规范**
   - TypeScript 严格模式？[是/否，默认: 是] → `代码规范.TypeScript.严格模式`
   - 文件大小限制？[默认: 300 行] → `代码规范.TypeScript.文件大小限制`
   - 测试覆盖要求？[是/否，默认: 否] → `代码规范.测试.测试覆盖要求`

9. **ESLint & Prettier**
   - 配置需保持一致？[是，必须] → `代码规范.ESLint & Prettier.配置一致性`
   - VSCode 保存时自动格式化？[是/否，默认: 是] → `代码规范.ESLint & Prettier.VSCode自动格式化`
   - 如启用，生成 `.vscode/settings.json`

10. **部署平台**
    - [ ] Vercel | [ ] Cloudflare Pages | [ ] Railway | [ ] Docker 自建 | [ ] 其他
    - → `技术栈.部署`

## 扫描提示 (仅 `/flow-init`)

- 框架：`package.json` + 项目结构 (next, react, vue)
- 数据库/ORM：`drizzle.config.ts`, `prisma/schema.prisma`
- UI 库/状态管理/i18n：`package.json` 依赖
- ESLint/Prettier：`.eslintrc.*`, `eslint.config.*`, `.prettierrc.*`
- VSCode：`.vscode/settings.json`
