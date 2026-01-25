# 组件规格：GoalProgressRing (增强)

## 用途
显示目标进度（圆形进度环）

## Props

```typescript
interface GoalProgressRingProps {
  goal: GoalProgress; // 或 { progress: number; current: number; target: number; }
  size?: 'sm' | 'md' | 'lg';
}
```

## 结构

```
┌─────────────────┐
│   [进度环 SVG]  │
│                 │
│   75%           │
│                 │
│   75/100        │
└─────────────────┘
```

## 尺寸

- **sm**: 80px
- **md**: 120px (默认)
- **lg**: 160px

## 样式

### 进度环
- **背景圆**: `rgba(0, 255, 65, 0.1)`
- **进度弧**: `brand.matrix` (#00FF41)
- **文字**: `text.neon` (#E0E0E0)
- **发光效果**: `filter: drop-shadow(0 0 4px #00FF41)`

### 状态变体

#### active (0-99%)
- 进度弧: `brand.matrix`
- 文字颜色: `text.neon`

#### completed (100%)
- 进度弧: `brand.matrix`
- 文字颜色: `brand.matrix`
- 显示完成图标（可选）

#### abandoned
- 进度弧: `text.dim`
- 文字颜色: `text.mist`

## 交互

- 无交互（仅展示）

## 响应式

- 自适应容器宽度

