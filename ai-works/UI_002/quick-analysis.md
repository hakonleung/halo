# UI_002: 动画背景效果

## 需求理解

为 NEO-LOG 添加契合赛博朋克设计风格的动画背景，使用纯 CSS 和布局实现，在所有页面生效。

## 设计风格要求

- 赛博朋克 + 复古未来主义
- Matrix 数据流 + 科幻 HUD
- 主色：矩阵绿 #00FF41、警报橙 #FF6B35、电光蓝 #00D4FF
- 背景色：深空黑 #0A0A0A

## 实现方案

### 步骤 1: 生成预览 HTML

创建 HTML 文件展示多种动画背景效果，供用户选择：
- Matrix 数据流效果
- 网格线动画
- 粒子/星空效果
- 扫描线效果
- 故障/噪点效果

### 步骤 2: 应用选中效果

根据用户选择，将效果应用到：
- `src/app/layout.tsx` - 在根布局中添加背景组件
- 创建背景组件文件（如 `src/components/layout/animated-background.tsx`）
- 使用 CSS 动画和布局实现，不依赖 JavaScript 动画库

## 修改清单

1. 创建预览 HTML 文件（临时文件，用户选择后删除）
2. 创建背景组件 `src/components/layout/animated-background.tsx`
3. 修改 `src/app/layout.tsx` 集成背景组件
4. 验证所有页面背景效果正常

## 技术要点

- 使用 CSS `@keyframes` 实现动画
- 使用 `position: fixed` 确保背景覆盖全屏
- 使用 `z-index` 确保背景在内容下方
- 性能优化：使用 `transform` 和 `opacity` 而非 `top/left`
- 确保背景不影响现有布局和交互

