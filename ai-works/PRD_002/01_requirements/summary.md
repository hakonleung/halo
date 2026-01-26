# 阶段 01 需求澄清 - 摘要

## 核心结论

本次需求旨在完善目标管理模块，包括：
- 实现完整的 API 路由（CRUD）
- 创建目标管理页面和组件
- 实现目标进度自动计算
- 提供 React Hooks 和类型定义

## 关键产出

1. **需求文档** (`requirements.md`)
   - 7 个章节完整覆盖：背景、用户、功能范围、场景、边界、指标、约束
   - Must Have: API 路由、页面、组件、Hooks、进度计算
   - Nice to Have: 提醒、分析、模板

2. **用户旅程图** (`journey.md`)
   - 创建并追踪目标流程
   - 管理现有目标流程
   - 详细步骤和情感曲线

## 供后续阶段使用

### 功能范围
- **Must Have**: API 路由（4个端点）、目标管理页面、进度计算、React Hooks、组件
- **Nice to Have**: 提醒、分析、模板
- **不做**: 分享、协作、导入导出、AI 建议

### 关键约束
- 目标名称最大 100 字符
- 单个用户最多 100 个活跃目标
- 目标进度计算时间 < 200ms
- 目标列表加载时间 < 500ms

### 成功指标
- 功能完整性 = 100%
- TypeScript/ESLint 错误 = 0
- 测试覆盖率 ≥ 80%
- AI 验收通过后自动进入下一阶段

## 注意事项

1. **现有基础**：数据库表、service、类型定义已存在，需要补充 API 路由和前端页面
2. **进度计算**：需要根据行为记录自动计算，涉及复杂逻辑
3. **状态流转**：支持 active/completed/abandoned 之间的转换
4. **性能考虑**：目标进度计算可能涉及大量数据，需要优化

## 关键词索引

| 关键词 | 原文位置 |
|--------|---------|
| 目标管理 | requirements.md 第1节 |
| API 路由 | requirements.md 第3节 Must Have |
| 目标进度计算 | requirements.md 第3节 Must Have |
| 达成条件 | requirements.md 第4节 场景1 |
| 状态管理 | requirements.md 第3节 Must Have |
| 边界条件 | requirements.md 第5节 |
| 成功指标 | requirements.md 第6节 |

