# TrendLineChart 组件规格

## 概述
行为趋势折线图，支持多系列、类型筛选、Hover 详情。

## Props

```typescript
interface TrendLineChartProps {
  data: TrendDataPoint[];
  selectedTypes?: string[]; // 筛选的行为类型
  onTypeChange?: (types: string[]) => void;
  height?: number;
  loading?: boolean;
}

interface TrendDataPoint {
  date: string; // ISO date
  total: number;
  byType: Record<string, number>;
}
```

## 状态变体

| 状态 | 样式 |
|------|------|
| Default | 显示所有类型折线 |
| Filtered | 高亮选中类型，其他灰色 |
| Hover | 显示垂直参考线 + Tooltip |
| Loading | 骨架屏 + 脉冲动画 |
| Empty | 虚线坐标轴 + 引导文字 |

## 结构

```
┌─────────────────────────────────────────────────┐
│  [类型筛选器: 全部 | 运动 | 学习 | ...]        │
├─────────────────────────────────────────────────┤
│                                                 │
│    ●━━━━●━━━━●                                 │
│   /      \    \        ← 折线                  │
│  ●        ●━━━━●━━━━●                          │
│                                                 │
│  ├──┼──┼──┼──┼──┼──┼──┤                        │
│  1/1 1/2 1/3 1/4 1/5 1/6 1/7                   │
└─────────────────────────────────────────────────┘
```

## 设计细节

| 元素 | 样式 |
|------|------|
| 折线 | 2px, 矩阵绿, 发光效果 |
| 数据点 | 6px 圆点, 填充 |
| 坐标轴 | 1px, #333 |
| 网格线 | 1px dashed, #222 |
| Tooltip | 背景 `bg.carbon`, 边框 `brand.matrix` |

## 动画

- 首次绘制: 从左到右 500ms
- Hover 点: scale(1.5) 150ms
- 切换筛选: 折线淡入淡出 300ms
