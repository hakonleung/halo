# 代码质量工具指南

本项目配置了完整的代码质量工具链，包括ESLint、Prettier和Pre-commit hooks，确保代码的一致性和质量。

## 📋 工具概览

- **ESLint**: JavaScript/TypeScript代码检查和自动修复
- **Prettier**: 代码格式化工具
- **Husky**: Git hooks管理
- **lint-staged**: 仅对staged文件运行检查

## 🚀 可用脚本

### 全局脚本 (根目录)

```bash
# 运行所有包的lint检查
pnpm lint

# 自动修复可修复的lint问题
pnpm lint:fix

# 格式化所有代码文件
pnpm format

# 检查代码格式（不修改文件）
pnpm format:check

# 类型检查
pnpm check-types
```

### 单个包脚本

```bash
# 对特定包运行lint
pnpm --filter @halo/stock lint
pnpm --filter @halo/storage lint

# 对特定包运行lint修复
pnpm --filter @halo/stock lint:fix
pnpm --filter @halo/storage lint:fix
```

## 🔒 Pre-commit Hooks

项目配置了自动的pre-commit检查，在每次 `git commit` 时会：

1. **自动运行lint检查** - 检测代码质量问题
2. **自动修复问题** - 修复可以自动修复的问题
3. **格式化代码** - 确保代码格式一致
4. **阻止有错误的提交** - 如果有无法自动修复的错误，阻止提交

### 工作流程

```bash
# 正常的git工作流程
git add .
git commit -m "feat: 添加新功能"

# pre-commit hooks会自动运行：
# ✔ 对staged文件运行ESLint
# ✔ 自动修复可修复的问题
# ✔ 运行Prettier格式化
# ✔ 如果一切正常，允许提交
# ✖ 如果有错误，阻止提交并显示错误信息
```

## 📁 配置文件

### 根目录配置

- `.prettierrc` - Prettier配置
- `.prettierignore` - Prettier忽略文件
- `eslint.config.mjs` - 根目录ESLint配置
- `.husky/pre-commit` - Pre-commit hook脚本

### lint-staged配置 (package.json)

```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "**/*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## 🎯 各包配置

每个包都有自己的ESLint配置：

- `packages/stock/eslint.config.mjs`
- `packages/storage/eslint.config.mjs`
- `apps/web/eslint.config.js` (Next.js应用)
- `apps/docs/eslint.config.js` (Next.js应用)

## 🛠️ ESLint规则

项目使用统一的ESLint配置（`@repo/eslint-config`），包括：

- TypeScript推荐规则
- React相关规则（适用于UI组件）
- Turbo规则（环境变量检查等）
- Prettier集成（避免格式冲突）
- 只报告警告（不会中断开发）

## 💡 最佳实践

### 开发时

1. **实时检查**: 配置编辑器ESLint插件获得实时反馈
2. **定期运行**: 定期运行 `pnpm lint` 检查整个项目
3. **修复警告**: 使用 `pnpm lint:fix` 自动修复问题

### 提交前

1. **让工具自动处理**: pre-commit hooks会自动检查和修复
2. **检查错误信息**: 如果提交被阻止，查看错误信息并手动修复
3. **重新提交**: 修复问题后重新尝试提交

### CI/CD集成

可以在CI/CD pipeline中添加这些检查：

```bash
# 检查代码质量
pnpm lint
pnpm format:check
pnpm check-types
```

## 🚫 绕过Pre-commit检查

⚠️ **不推荐**，但如果确实需要跳过检查：

```bash
git commit --no-verify -m "紧急修复"
```

## 📞 故障排除

### 常见问题

1. **"ESLint配置错误"**
   - 确保已安装所有依赖: `pnpm install`
   - 检查配置文件语法是否正确

2. **"pre-commit hooks不工作"**
   - 重新安装hooks: `pnpm prepare`
   - 检查 `.husky/pre-commit` 文件权限

3. **"格式化冲突"**
   - 运行 `pnpm format` 统一格式化
   - 检查编辑器配置是否与Prettier冲突

### 获取帮助

如果遇到问题，可以：

1. 查看ESLint错误信息的详细说明
2. 运行 `pnpm lint --help` 查看可用选项
3. 检查项目配置文件是否正确
