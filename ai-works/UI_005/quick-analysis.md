# 快速分析

> UI_005 | Completion Criteria 极客风格和日期选择器样式优化 | UI微调

## 需求理解

### 需求 1: Completion Criteria 的显示更加极客，每一项都换行

**当前状态**:
- `src/components/log/goal-detail-drawer.tsx` 中 Completion Criteria 显示在一行
- 格式：`Behavior: {id} | Metric: {metric} | Target: {value} | Period: {period}`

**期望状态**:
- 每一项信息单独换行显示
- 使用更极客的风格（等宽字体、代码风格、标签化显示）
- 符合赛博朋克设计风格

### 需求 2: 日期选择器的风格需要和设计保持一致

**当前状态**:
- 日期选择器使用 Input type="date"
- 样式已通过 input theme 配置，但可能需要特殊处理浏览器默认样式

**期望状态**:
- 确保日期选择器符合设计规范
- 背景: #0A0A0A (bg.deep)
- 边框: 1px solid #2A2A2A (bg.dark)
- 聚焦: 边框#00FF41 + 外发光
- 占位符: #555555 (text.dim)

## 相关代码定位

### 文件清单

1. **Completion Criteria 显示**
   - `src/components/log/goal-detail-drawer.tsx` - 需要修改显示格式

2. **日期选择器**
   - `src/components/shared/filter-bar.tsx` - FilterBar 中的日期选择器
   - `src/components/forms/goal-form.tsx` - Goal 表单中的日期选择器
   - `src/components/log/date-range-picker.tsx` - 日期范围选择器
   - `src/styles/components/input.ts` - Input theme 配置

## 修改清单

### 1. 修改 Completion Criteria 显示

- [ ] 修改 `src/components/log/goal-detail-drawer.tsx`
  - 将每项信息改为单独换行
  - 使用等宽字体和代码风格
  - 添加标签化显示（如 `[BEHAVIOR]`, `[METRIC]` 等）

### 2. 优化日期选择器样式

- [ ] 检查 `src/styles/components/input.ts` 是否已符合设计规范
- [ ] 如果需要，添加日期选择器的特殊样式（浏览器默认样式覆盖）
- [ ] 确保所有使用日期选择器的地方样式一致

### 3. 验证

- [ ] 运行 `pnpm tsc --noEmit` 检查类型
- [ ] 运行 `pnpm lint` 检查代码规范
- [ ] 手动测试 Completion Criteria 显示
- [ ] 手动测试日期选择器样式

