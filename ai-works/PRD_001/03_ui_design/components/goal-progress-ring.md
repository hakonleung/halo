# GoalProgressRing 组件规格

## 概述
环形进度条，展示单个目标完成进度，支持点击展开详情。

## Props

```typescript
interface GoalProgressRingProps {
  goal: {
    id: string;
    name: string;
    progress: number; // 0-100
    target: number;
    current: number;
    unit?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  expanded?: boolean;
  onToggle?: () => void;
  loading?: boolean;
}
```

## 状态变体

| 状态 | 样式 |
|------|------|
| Default | 环形进度 + 中心百分比 |
| Hover | 外圈发光 |
| Expanded | 下方展开关联行为列表 |
| Complete | 100% + 勾选动画 + 庆祝效果 |
| Loading | 灰色环 + 脉冲 |
| Empty | 虚线环 + "设置目标" |

## 尺寸

| Size | 环直径 | 线宽 |
|------|--------|------|
| sm | 80px | 6px |
| md | 120px | 8px |
| lg | 160px | 10px |

## 结构

```
    ┌───────────┐
   ╱             ╲
  │      68%      │  ← 中心百分比
  │    阅读目标    │  ← 目标名称
   ╲             ╱
    └───────────┘
         ↓ (展开时)
  ┌─────────────────┐
  │ 关联行为:        │
  │ • 阅读 30min ✓  │
  │ • 阅读 45min ✓  │
  │ • 阅读 20min    │
  └─────────────────┘
```

## 颜色

| 进度 | 颜色 |
|------|------|
| 0-30% | `brand.alert` (警报橙) |
| 31-70% | `brand.cyber` (电光蓝) |
| 71-99% | `brand.matrix` (矩阵绿) |
| 100% | `brand.matrix` + 发光 + 脉冲 |

## 动画

- 首次加载: 从0到目标值 800ms ease-out
- 百分比数字: 同步滚动
- 完成: 脉冲发光 + 可选庆祝粒子
- 展开/收起: 高度动画 300ms
