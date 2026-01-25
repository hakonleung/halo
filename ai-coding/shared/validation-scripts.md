# 验证脚本

> 统一的验证命令和检查脚本。

## 基础验证命令

```bash
# TypeScript 编译检查
pnpm tsc --noEmit

# Lint 检查
pnpm lint

# 运行测试
pnpm test

# 完整验证 (组合命令)
pnpm test && pnpm lint && pnpm tsc --noEmit
```

## 脚本化校验 (推荐)

### 文档 ↔ 代码同步检查

```bash
# 自动选择最新 PRD 目录 (如存在)
./ai-coding/scripts/flow-sync-check.sh

# 指定 PRD 目录，并设置门槛
./ai-coding/scripts/flow-sync-check.sh \
  --work-dir ai-coding/works/PRD_XXX \
  --min-rate 0.95
```

### 阶段验证 (结构 + 测试)

```bash
# 全量校验 + TODO/FIXME 检查
./ai-coding/scripts/flow-stage-validate.sh --stage all

# 指定阶段校验
./ai-coding/scripts/flow-stage-validate.sh --stage 05b
```

## CI 工作流

已提供 GitHub Actions 工作流示例：

- `.github/workflows/ai-coding-quality.yml`
- 支持 `workflow_dispatch` 传入 `work_dir` / `min_rate`

## 阶段验证命令

### 05a 前置阶段

```bash
# 检查类型文件
ls src/types/*-server.ts src/types/*-client.ts

# 检查类型测试
ls src/types/__tests__/*.test.ts

# 运行类型测试
pnpm test src/types/__tests__/

# 检查 Schema 更新
git diff src/db/schema.ts | head -20

# 检查迁移文件
ls supabase/migrations/*.sql | tail -1
```

### 05b 后端阶段

```bash
# 检查 Service 文件
ls src/lib/*-service.ts

# 检查 API 文件
ls src/app/api/*/route.ts
```

### 05c 前端阶段

```bash
# 检查 Hooks 文件
ls src/hooks/use-*.ts

# 检查组件目录
ls -d src/components/*/

# 检查页面文件
ls src/app/*/page.tsx
```

### 06 验证阶段

```bash
# 检查 E2E 文件
ls e2e/*.spec.ts

# 运行 E2E 测试
pnpm test:e2e
```

## 同步检查命令

```bash
# (脚本等价) ./ai-coding/scripts/flow-sync-check.sh --work-dir ai-coding/works/PRD_XXX

# API 端点数量检查
grep -c "^### \(GET\|POST\|PUT\|DELETE\)" api-spec.md

# 类型定义检查
grep -c "^interface\|^type " tech-design.md

# 用户故事格式检查
grep -c "作为.*我希望.*以便" prd.md

# 验收标准格式检查
grep -c "Given\|When\|Then" prd.md

# TODO/FIXME 检查 (应输出 0)
grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | wc -l
```

## 指标统计命令

```bash
# 统计代码变更
git diff --stat HEAD~1 | tail -1

# 统计测试覆盖率
pnpm test:coverage | grep "All files"

# 统计 Token (估算)
wc -c ai-coding/works/PRD_XXX/**/*.md | tail -1 | awk '{print int($1/4)}'
```

## 自动通过条件

**可选** 阶段满足以下条件时自动通过：

1. AI 自验收全部通过（含交叉验证）
2. `pnpm test && pnpm lint && pnpm tsc --noEmit` 无错误
3. 无新增 TODO/FIXME 注释

```bash
# 自动验证脚本
./ai-coding/scripts/flow-stage-validate.sh --stage all
# 输出 0 则自动通过
```
