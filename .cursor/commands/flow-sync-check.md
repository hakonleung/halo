# 检查文档代码同步

检查文档与代码同步状态。

## 触发指令

```
/flow-sync-check [单号]?
```

## 参数

- `[单号]?`: 可选，指定工作流单号，不指定则检查当前工作流

## 检查内容

- **api-spec.md**: API 端点 - `src/app/api/**`
- **tech-design.md**: 数据模型 - `src/db/schema.ts`
- **ui-design.md**: 组件清单 - `src/components/**`

## 同步率门槛

- **05 完成**: ≥ 90%
- **06 验证**: ≥ 95%
- **07 部署**: = 100%

## 推荐脚本

```bash
bash ai-coding/scripts/flow-sync-check.sh --work-dir ai-works/PRD_XXX
```

## 详细说明

详细说明请参考：`ai-coding/action-status.md`

