# 快速分析

> UI_004 | Timeline view mode 和筛选器组件优化 | UI微调

## 需求理解

### 需求 1: Timeline view 的 mode 改成 switch，添加 theme

**当前状态**:
- `src/components/log/log-timeline.tsx` 使用两个 Button 组件切换 split/merge 模式
- 没有 Switch 组件的 theme 定义

**期望状态**:
- 使用 Switch 组件替代 Button 切换
- 创建 Switch 组件的 theme 配置，符合赛博朋克主题

### 需求 2: 统一筛选器组件的高度，修改 input/select 的 theme

**当前状态**:
- `src/components/shared/filter-bar.tsx` 中 input 和 select 使用不同的 size（compact 时 xs，否则 md）
- input 和 select 的高度不一致（xs: 32px, md: 40px）
- select trigger 没有明确的 size 配置

**期望状态**:
- 统一 FilterBar 中所有 input 和 select 的高度
- 更新 input/select theme 以支持统一高度
- 确保视觉一致性

## 相关代码定位

### 文件清单

1. **Timeline view mode 切换**
   - `src/components/log/log-timeline.tsx` - 需要将 Button 改为 Switch

2. **Switch theme**
   - `src/styles/components/switch.ts` - 需要新建
   - `src/styles/theme.ts` - 需要添加 switch recipe

3. **FilterBar 组件**
   - `src/components/shared/filter-bar.tsx` - 需要统一高度

4. **Input/Select theme**
   - `src/styles/components/input.ts` - 可能需要调整
   - `src/styles/components/select.ts` - 需要添加 size 支持

## 修改清单

### 1. 创建 Switch theme

- [ ] 创建 `src/styles/components/switch.ts`
- [ ] 定义符合赛博朋克主题的 Switch 样式
- [ ] 在 `src/styles/theme.ts` 中注册 switch recipe

### 2. 修改 Timeline view mode 切换

- [ ] 修改 `src/components/log/log-timeline.tsx`
  - 将 Button 组件改为 Switch
  - 使用 Switch 切换 split/merge 模式
  - 添加标签显示当前模式

### 3. 统一 FilterBar 组件高度

- [ ] 修改 `src/components/shared/filter-bar.tsx`
  - 统一所有 input 和 select 使用相同的高度
  - 建议使用 `xs` size（32px）以保持紧凑

### 4. 更新 Select theme 支持 size

- [ ] 修改 `src/styles/components/select.ts`
  - 添加 size variants（sm, md, lg）
  - 确保 trigger 高度与 input 一致

### 5. 验证

- [ ] 运行 `pnpm tsc --noEmit` 检查类型
- [ ] 运行 `pnpm lint` 检查代码规范
- [ ] 手动测试 Timeline view mode 切换
- [ ] 手动测试 FilterBar 组件显示

