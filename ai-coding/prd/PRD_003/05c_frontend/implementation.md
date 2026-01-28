# PRD_003 阶段 05c: 前端实现

## 概述

完成样式系统的组件 Recipe 实现，重构 4 个现有组件，新建 4 个组件。

## 完成任务

### T-05c-01: Button Recipe 重构

**文件**: `src/styles/components/button.ts`

- 新增变体: primary (渐变+脉冲), secondary (边框发光), danger, ghost
- 新增尺寸: sm, md, lg
- 添加动画: pulse-glow hover, glitch active

### T-05c-02: Input Recipe 重构

**文件**: `src/styles/components/input.ts`

- 更新变体: outline, solid, subtle
- 新增尺寸: sm, md, lg
- 添加效果: 聚焦发光, 错误发光

### T-05c-03: Select Slot Recipe 扩展

**文件**: `src/styles/components/select.ts`

- 添加毛玻璃下拉面板
- 添加选项悬停/选中样式
- 添加发光边框效果

### T-05c-04: Drawer Slot Recipe 扩展

**文件**: `src/styles/components/drawer.ts`

- 添加毛玻璃背景
- 添加边缘发光效果
- 新增尺寸变体: sm, md, lg, full

### T-05c-05: Card Recipe 新建

**文件**: `src/styles/components/card.ts`

- 变体: default, decorated (边角装饰), scanline (扫描线), solid
- 尺寸: sm, md, lg
- 效果: 毛玻璃, hover 发光

### T-05c-06: Badge Recipe 新建

**文件**: `src/styles/components/badge.ts`

- 颜色方案: success, warning, error, info, neutral
- 尺寸: sm, md, lg
- 效果: 半透明背景, 发光边框

### T-05c-07: BottomNav Slot Recipe 新建

**文件**: `src/styles/components/bottom-nav.ts`

- Slots: root, item, icon, label
- 效果: 毛玻璃背景, 图标发光

### T-05c-08: Popover Slot Recipe 新建

**文件**: `src/styles/components/popover.ts`

- Slots: content, header, body, footer, arrow, closeTrigger
- 效果: 毛玻璃面板

### T-05c-09: Theme 入口重构

**文件**: `src/styles/theme.ts`

- 整合 tokens: colors, fonts, keyframes, glass, glow
- 整合 recipes: input, button, fieldLabel, card, badge
- 整合 slotRecipes: select, drawer, bottomNav, popover

### T-05c-10: 验证

- TypeScript 编译: ✅ 通过
- ESLint: ✅ 通过

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/styles/components/button.ts` | 重构 |
| `src/styles/components/input.ts` | 重构 |
| `src/styles/components/select.ts` | 扩展 |
| `src/styles/components/drawer.ts` | 扩展 |
| `src/styles/components/card.ts` | 新建 |
| `src/styles/components/badge.ts` | 新建 |
| `src/styles/components/bottom-nav.ts` | 新建 |
| `src/styles/components/popover.ts` | 新建 |
| `src/styles/theme.ts` | 重构 |

## 技术说明

### 降级处理

Chakra UI 的 `backdropFilter` 属性会自动处理浏览器前缀，无需手动添加 `-webkit-` 前缀。

### 动画引用

Recipe 中通过字符串引用 keyframes 名称，Chakra UI 会自动关联 theme 中定义的 keyframes。

```typescript
_hover: {
  animation: 'pulse-glow 2s ease-in-out infinite',
}
```
