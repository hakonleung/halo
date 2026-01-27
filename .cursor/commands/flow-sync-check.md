# 检查文档与代码同步状态

检查文档与代码同步状态。

## 触发指令

```
/flow-sync-check [单号]?
```

## 重要提示

**在执行此命令前，必须先读取完整的详细说明文件：**

`ai-coding/action-status.md`

该文件包含完整的执行流程、详细步骤、输出格式等所有必要信息。请先读取该文件，然后按照其中的详细说明执行。

## 执行流程

检查文档与代码的同步状态，包括：
- api-spec.md ↔ `src/app/api/**`
- tech-design.md ↔ `src/db/schema.ts`
- ui-design.md ↔ `src/components/**`

## 检查内容

- **api-spec.md**: API 端点 - `src/app/api/**`
- **tech-design.md**: 数据模型 - `src/db/schema.ts`
- **ui-design.md**: 组件清单 - `src/components/**`

## 同步率门槛

- **05 完成**: ≥ 90%
- **06 验证**: ≥ 95%
- **07 部署**: = 100%

## 参数说明

- `[单号]?`: 可选，指定工作流单号，不指定则检查当前工作流

## 推荐脚本

`bash ai-coding/scripts/flow-sync-check.sh --work-dir ai-works/PRD_XXX`

## 详细说明

完整的工作流说明、执行步骤、输出格式等详细信息，请参考：

`ai-coding/action-status.md`

**请务必在执行前阅读该文件的完整内容。**

