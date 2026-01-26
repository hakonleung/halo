# 工作流归档

归档已完成或已终止的工作流，生成总结报告并清理文件。

## 触发指令

```
/flow-archive [单号]
```

示例：
- `/flow-archive PRD_001`
- `/flow-archive PRD_002`
- `/flow-archive QUICK_001`

## 适用场景

- 工作流已完成（status: completed）
- 工作流已终止（status: cancelled）
- 需要清理 ai-works 目录，保留归档记录

## 执行流程

1. **读取工作流文件** - 读取 ai-works/[单号] 目录下的关键文件（overview.json、requirements.md、prd.md、validation report 等）
2. **生成归档报告** - 生成包含四个部分的归档报告：需求是什么、做了什么、还有什么没做、质量如何
3. **归档文件** - 将报告保存到 ai-works/_archived/[单号]/archive.md
4. **删除原始目录** - 删除 ai-works/[单号] 整个目录

## 归档报告内容

归档报告必须包含以下四个部分：

1. **需求是什么** - 背景与痛点、功能范围、成功指标
2. **做了什么** - 完成阶段、实现功能、代码统计
3. **还有什么没做** - 未实现功能、待改进项、技术债务
4. **质量如何** - 验证结果、代码质量指标、文档同步率、部署状态

## 详细说明

详细说明请参考：`ai-coding/action-archive.md`
