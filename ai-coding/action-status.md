# 状态管理指令

> 查看和管理工作流状态。

## 触发指令

- **`/flow-status`**: 查看当前工作流状态
- **`/flow-list`**: 列出所有工作流
- **`/flow-sync-check [单号]?`**: 检查文档与代码同步状态
- **`/read-full [阶段] [关键词]?`**: 强制读取完整文档

## /flow-status

查看当前工作流状态。

**输出**:
- 当前工作流单号
- 当前阶段
- 阶段状态（pending/in_progress/completed）
- 风险等级
- 人类介入要求

## /flow-list

列出所有工作流。

**输出**:
- 所有工作流列表（单号、标题、当前阶段、状态、创建时间）

## /flow-sync-check

检查文档与代码同步状态。

**参数**:
- `[单号]?`: 可选，指定工作流单号，不指定则检查当前工作流

**检查内容**:
- **api-spec.md**: API 端点 - `src/app/api/**`
- **tech-design.md**: 数据模型 - `src/server/db/schema.ts`
- **ui-design.md**: 组件清单 - `src/client/components/**`

**同步率门槛**:
- **05 完成**: ≥ 90%
- **06 验证**: ≥ 95%
- **07 部署**: = 100%

**推荐脚本**: `bash ai-coding/scripts/flow-sync-check.sh --work-dir ai-works/PRD_XXX`

## /read-full

强制读取完整文档，用于当 `summary.md` 摘要不足时。

**参数**:
- `[阶段]`: 阶段编号（如 `01`, `02_prd`, `03_ui_design`）
- `[关键词]?`: 可选，用于定位特定章节

**使用场景**:
- 摘要信息不足
- 需要查看完整上下文
- 通过关键词索引定位原文章节

