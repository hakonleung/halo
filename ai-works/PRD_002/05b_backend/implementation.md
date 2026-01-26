# 阶段 05b: 后端实现

## 完成内容

### 1. 增强 goal-service.ts

✅ **新增方法**:
- `getGoal(id)` - 获取单个目标
- `getGoals()` - 支持筛选和排序参数

✅ **新增接口**:
- `GetGoalsParams` - 筛选和排序参数类型

### 2. 创建 goal-progress-service.ts

✅ **进度计算服务**:
- `calculateProgress()` - 计算单个目标进度
- `calculateBatchProgress()` - 批量计算进度

✅ **功能特性**:
- 支持多种指标类型 (count/sum/avg)
- 支持多种周期 (daily/weekly/monthly)
- 自动计算进度百分比
- 判断目标是否完成
- 计算剩余天数

### 3. 创建 API 路由

✅ **GET /api/goals**:
- 获取用户所有目标
- 支持筛选 (status, category)
- 支持排序 (created_at, name)
- 返回 Client 类型

✅ **POST /api/goals**:
- 创建新目标
- 数据验证 (名称长度、日期范围、达成条件)
- 返回 Client 类型

✅ **GET /api/goals/[id]**:
- 获取单个目标详情
- 自动计算目标进度
- 返回目标 + 进度信息

✅ **PATCH /api/goals/[id]**:
- 更新目标
- 数据验证
- 返回更新后的目标

✅ **DELETE /api/goals/[id]**:
- 删除目标
- 权限验证

### 4. 类型转换

✅ **Server ↔ Client 转换**:
- 使用 `convertServerGoalToClient()` 函数
- 字段名转换 (user_id → userId)
- Date 类型处理

## 实现细节

### 进度计算算法

1. **解析达成条件**: 遍历目标的 criteria 数组
2. **计算时间范围**: 根据 period 计算查询时间范围
3. **查询行为记录**: 根据 behavior_id 和时间范围查询记录
4. **计算指标值**: 根据 metric 类型计算 (count/sum/avg)
5. **计算进度**: 每个条件的进度取最小值（所有条件必须满足）
6. **判断完成**: 所有条件进度 >= 100% 时标记为完成

### 数据验证

- **目标名称**: 必填，最大 100 字符
- **开始日期**: 必填
- **结束日期**: 如果填写，必须 >= 开始日期
- **达成条件**: 至少一个

### 错误处理

- 401: 未认证
- 404: 目标不存在
- 400: 数据验证失败
- 500: 服务器错误

## 后续工作

- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 性能优化（缓存、批量计算）

