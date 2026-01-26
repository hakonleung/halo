# 配置询问清单使用说明

## 通用流程

### `/flow-create` (新建项目)

1. 读取 `*-questions.md` → 询问用户 → 读取 `*-defaults.md` → 生成 context 文件
2. 每个阶段生成后询问：`确认` 进入下一阶段，`修改 [内容]` 重新生成

### `/flow-init` (初始化已有项目)

1. 扫描项目代码提取信息
2. 读取 `*-questions.md` → 用扫描结果填充 → 询问用户确认/修改 → 读取 `*-defaults.md` → 生成 context 文件
3. 每个阶段生成后询问：`确认` 进入下一阶段，`修改 [内容]` 重新生成

## 扫描提示

- **项目名称**: `package.json.name`
- **页面结构**: `src/app/` 或路由文件
- **技术栈**: `package.json` 依赖 + 配置文件
- **UI配置**: `theme.ts`, `tailwind.config.js`
- **开发工具**: `.eslintrc.*`, `.prettierrc.*`, `.vscode/settings.json`

## 字段映射

问题回答会映射到 context 文件的对应字段，映射关系在每个问题的注释中说明（用 `→` 表示）。
