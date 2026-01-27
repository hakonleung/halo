# 工作流归档指令

归档已完成或已终止的工作流，生成总结报告并清理文件。

## 触发指令

```
/flow-archive [单号]
```

**示例**:
- `/flow-archive PRD_001`
- `/flow-archive PRD_002`
- `/flow-archive QUICK_001`

## 重要提示

**在执行此命令前，必须先读取完整的详细说明文件：**

`ai-coding/action-archive.md`

该文件包含完整的执行流程、详细步骤、输出格式等所有必要信息。请先读取该文件，然后按照其中的详细说明执行。

## 执行流程

1. 读取工作流文件
2. 生成归档报告
3. 保存到 `ai-works/_archived/[单号]/`
4. 删除原始目录
5. 提交到 Git

## 参数说明

- `[单号]`: 工作流单号（如 PRD_001, QUICK_001）

## 适用场景

- 工作流已完成（status: completed）
- 工作流已终止（status: cancelled）
- 需要清理 ai-works 目录，保留归档记录

## 详细说明

完整的工作流说明、执行步骤、输出格式等详细信息，请参考：

`ai-coding/action-archive.md`

**请务必在执行前阅读该文件的完整内容。**
