# 组件规格：GoalCard

## 用途
在目标列表中展示单个目标的摘要信息

## Props

```typescript
interface GoalCardProps {
  goal: Goal;
  onClick?: (goalId: string) => void;
}
```

## 结构

```
┌─────────────────────────────────┐
│ HStack (justify: space-between) │
│   Text: 目标名称                │
│   GoalStatusBadge               │
├─────────────────────────────────┤
│ Text: 描述文本...               │
├─────────────────────────────────┤
│ HStack                          │
│   Text: "分类: 健康"            │
│   Text: "|"                     │
│   Text: "开始: 2026-01-01"      │
├─────────────────────────────────┤
│ HStack (align: center)          │
│   GoalProgressRing (size: md)   │
│   VStack                        │
│     Text: "75 / 100"            │
│     Text: "剩余: 30天"          │
└─────────────────────────────────┘
```

## 样式

### 容器
- `bg.carbon` (#1A1A1A)
- `border`: 1px solid `rgba(0, 255, 65, 0.3)`
- `borderRadius`: 4px
- `padding`: 16px
- `cursor`: pointer
- `transition`: all 150ms ease-out

### 悬停效果
- `borderColor`: `rgba(0, 255, 65, 0.5)`
- `boxShadow`: `0 0 15px rgba(0, 255, 65, 0.2)`

### 状态变体

#### active
- 边框颜色: `brand.matrix` (rgba(0, 255, 65, 0.3))
- 进度环: 绿色

#### completed
- 边框颜色: `brand.matrix` (rgba(0, 255, 65, 0.2))
- 进度环: 绿色 (100%)
- 显示完成图标

#### abandoned
- 边框颜色: `text.dim` (rgba(136, 136, 136, 0.3))
- 进度环: 灰色
- 显示放弃图标

## 交互

- **点击**: 调用 `onClick(goal.id)` 或导航到 `/goals/[id]`
- **悬停**: 边框亮度增加，发光效果

## 响应式

- **Desktop**: 宽度自适应，最小宽度 300px
- **Mobile**: 宽度 100%

