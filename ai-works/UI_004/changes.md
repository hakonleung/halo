# 实现记录

> UI_004 | Timeline view mode 和筛选器组件优化

## 修改文件清单

### 新建文件

1. `src/styles/components/switch.ts`
   - 创建 Switch 组件的 theme 配置
   - 定义符合赛博朋克主题的样式
   - 支持 sm/md/lg 三种尺寸

### 修改文件

1. `src/styles/theme.ts`
   - 导入 switchRecipe
   - 在 recipes 中注册 switch

2. `src/components/log/log-timeline.tsx`
   - 将 Button 组件改为 Switch 组件
   - 使用 Switch 切换 split/merge 模式
   - 添加标签显示当前模式

3. `src/components/shared/filter-bar.tsx`
   - 统一所有 input 和 select 使用 `xs` size（32px 高度）
   - 移除 compact 参数对 size 的影响

4. `src/styles/components/select.ts`
   - 添加 size variants（sm, md, lg）
   - 确保 trigger 高度与 input 一致

## 实现细节

### Switch Theme

- 使用 `defineSlotRecipe` 定义 slot recipe
- 支持 root, track, thumb, label 四个 slots
- track 背景色：未选中 `bg.dark`，选中 `brand.matrix`
- thumb 背景色：未选中 `bg.carbon`，选中 `bg.deep`
- 添加发光效果和边框样式

### Timeline View Mode 切换

- 使用 Switch 替代两个 Button
- Switch checked 状态表示 merge 模式
- 添加标签显示当前模式（Split/Merge）

### FilterBar 高度统一

- 所有 input 统一使用 `size="xs"`（32px 高度）
- 所有 select 统一使用 `size="xs"`（32px 高度）
- 移除 compact 参数对 size 的影响，保持视觉一致性

### Select Theme Size 支持

- 添加 sm/md/lg 三种尺寸
- sm: 32px 高度，12px 字体
- md: 40px 高度，14px 字体（默认）
- lg: 48px 高度，16px 字体

## 验证结果

- TypeScript 类型检查：通过
- ESLint 检查：通过
- 功能测试：待手动测试

