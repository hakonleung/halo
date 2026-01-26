# 组件规格：GoalForm

## 用途
创建或编辑目标

## Props

```typescript
interface GoalFormProps {
  goal?: Goal; // 编辑时传入
  onSubmit: (goal: GoalCreateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

## 结构

```
┌─────────────────────────────────────┐
│ Heading: "创建目标" / "编辑目标"     │
├─────────────────────────────────────┤
│ VStack (gap: 6)                     │
│   Field.Root (required)             │
│     Field.Label: "目标名称"          │
│     Input (maxLength: 100)           │
│   Field.Root                        │
│     Field.Label: "描述"              │
│     Textarea (rows: 3)               │
│   Field.Root (required)             │
│     Field.Label: "分类"               │
│     Select                           │
│   Field.Root (required)             │
│     Field.Label: "开始日期"          │
│     Input (type: date)               │
│   Field.Root                        │
│     Field.Label: "结束日期"          │
│     Input (type: date)               │
├─────────────────────────────────────┤
│ Heading: "达成条件"                 │
│ VStack (gap: 4)                     │
│   GoalCriteriaForm (×N)             │
│   Button: "+ 添加条件"               │
├─────────────────────────────────────┤
│ HStack (justify: flex-end, gap: 4) │
│   Button: "取消" (Secondary)         │
│   Button: "保存" (Primary)           │
└─────────────────────────────────────┘
```

## 字段定义

### 目标名称
- **类型**: Input
- **必填**: 是
- **最大长度**: 100 字符
- **验证**: 非空，长度 ≤ 100

### 描述
- **类型**: Textarea
- **必填**: 否
- **行数**: 3

### 分类
- **类型**: Select
- **必填**: 是
- **选项**: 健康 / 财务 / 习惯 / 学习 / 其他

### 开始日期
- **类型**: Input (type: date)
- **必填**: 是
- **验证**: 非空

### 结束日期
- **类型**: Input (type: date)
- **必填**: 否
- **验证**: 如果填写，必须 ≥ 开始日期

### 达成条件
- **类型**: GoalCriteriaForm[]
- **必填**: 是（至少一个）
- **验证**: 每个条件必须完整

## 验证规则

1. 目标名称: 必填，最大 100 字符
2. 开始日期: 必填
3. 结束日期: 如果填写，必须 ≥ 开始日期
4. 达成条件: 至少一个，每个条件必须完整

## 错误提示

- 显示在对应字段下方
- 颜色: `brand.alert` (#FF6B35)
- 字体: `text.mist`, fontSize: 12px

## 交互

- **保存**: 验证通过后调用 `onSubmit`
- **取消**: 调用 `onCancel`
- **添加条件**: 添加新的 GoalCriteriaForm
- **删除条件**: 从列表中移除

## 响应式

- **Desktop**: 侧边栏或模态框，宽度 500-600px
- **Mobile**: 全屏，padding: 16px

