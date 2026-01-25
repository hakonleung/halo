# StatsCard 组件规格

## 概述
统计卡片，展示单个数值指标，支持趋势指示。

## Props

```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string; // e.g., "+12%"
  };
  sparkline?: number[]; // 迷你趋势线数据
  loading?: boolean;
  onClick?: () => void;
}
```

## 状态变体

| 状态 | 样式 |
|------|------|
| Default | 背景 `bg.carbon`，边框 `brand.matrix` 30% |
| Hover | 边框亮度+，box-shadow 发光 |
| Loading | 骨架屏动画 |
| Empty | 虚线边框，引导文字 |

## 结构

```
┌──────────────────────────────┐
│  [icon]  标题                │
│                              │
│         42                   │ ← 大号数字
│     ▲ +12%                   │ ← 趋势指示
│  ～～～～～～～～            │ ← sparkline (可选)
└──────────────────────────────┘
```

## 尺寸

| 属性 | 值 |
|------|-----|
| 宽度 | flex: 1, min-width: 160px |
| 高度 | 固定 180px |
| 内边距 | 16px |
| 圆角 | 4px |

## 动画

- 入场: fadeInUp 300ms
- 数值变化: 数字滚动 300ms
- Hover: scale(1.02) 150ms
