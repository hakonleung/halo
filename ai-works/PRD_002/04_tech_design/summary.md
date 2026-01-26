# 阶段 04 技术设计 - 摘要

## 核心结论

基于 PRD 和 UI 设计，完成了目标管理模块的技术设计，包括数据模型、API 接口、类型定义、组件架构、任务拆分和测试计划。

## 关键产出

1. **技术设计文档** (`tech-design.md`)
   - 数据模型（数据库表结构、达成条件结构）
   - API 接口（6个端点）
   - 类型定义（Server/Client）
   - 组件架构
   - 任务拆分（05a/05b/05c）
   - 测试策略
   - 性能优化
   - 错误处理
   - 安全考虑

2. **架构设计文档** (`architecture.md`)
   - 系统架构图
   - 数据流图（创建、查看、计算进度）
   - 组件层次结构
   - 服务层架构
   - 状态管理
   - 错误处理架构
   - 性能优化架构
   - 安全架构

3. **API 规格文档** (`api-spec.md`)
   - 6个 API 端点详细规格
   - 请求/响应格式
   - 错误码定义
   - 数据类型定义

4. **测试计划文档** (`test-plan.md`)
   - 测试策略
   - 单元测试用例
   - 集成测试用例
   - 组件测试用例
   - E2E 测试用例
   - 性能测试
   - 安全测试

## 供后续阶段使用

### API 端点清单
1. `GET /api/goals` - 获取目标列表
2. `POST /api/goals` - 创建目标
3. `GET /api/goals/[id]` - 获取目标详情
4. `PATCH /api/goals/[id]` - 更新目标
5. `DELETE /api/goals/[id]` - 删除目标
6. `GET /api/goals/[id]/progress` - 获取目标进度（可选）

### 新服务
1. **goal-progress-service.ts** - 目标进度计算服务
   - `calculateProgress()` - 计算单个目标进度
   - `calculateBatchProgress()` - 批量计算进度

### 新组件
1. `components/goals/goal-list.tsx`
2. `components/goals/goal-card.tsx`
3. `components/goals/goal-form.tsx`
4. `components/goals/goal-criteria-form.tsx`
5. `components/goals/goal-status-badge.tsx`
6. `components/goals/goal-progress-chart.tsx`

### 新 Hooks
1. `hooks/use-goals.ts`
   - `useGoals()` - 列表查询
   - `useGoal(id)` - 详情查询
   - `useCreateGoal()` - 创建 mutation
   - `useUpdateGoal()` - 更新 mutation
   - `useDeleteGoal()` - 删除 mutation

### 新页面
1. `app/goals/page.tsx` - 目标列表页面
2. `app/goals/[id]/page.tsx` - 目标详情页面

### 任务拆分
- **05a**: 类型测试、测试环境准备
- **05b**: API 路由、Service 层、进度计算服务、单元测试
- **05c**: Hooks、页面、组件、组件测试

## 注意事项

1. **进度计算复杂度**: 需要支持多种指标类型（count/sum/avg）和周期（daily/weekly/monthly），需要性能优化
2. **类型转换**: Server 和 Client 类型需要正确转换（字段名、Date ↔ ISO string）
3. **性能要求**: 列表加载 < 500ms，进度计算 < 200ms
4. **测试覆盖**: 单元测试 ≥ 80%，集成测试 ≥ 70%，组件测试 ≥ 60%

## 关键词索引

| 关键词 | 原文位置 |
|--------|---------|
| neolog_goals | tech-design.md 第1.1节 |
| GoalCriteria | tech-design.md 第1.2节 |
| /api/goals | api-spec.md |
| goal-progress-service | tech-design.md 第4.5节 |
| calculateProgress | tech-design.md 第4.5节 |
| 任务拆分 | tech-design.md 第5节 |
| 测试计划 | test-plan.md |

