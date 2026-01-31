# FEAT_006 快速分析

## 需求类型

功能迭代 + UI微调

## 需求描述

1. skeleton添加符合主题的theme
2. abandon和delete这种操作，使用chakra的组件来做前置确认
3. 使所有页面的组件更加紧凑
4. 移除chat页面，chat应该作为全局组件，在页面右下角添加一个浮动的入口
5. records应该展示record的卡片，而不是一个列表，应该像goals一样
6. 抽取goals/records的筛选器，在goals/records/notes内复用，筛选器的设计更加紧凑，支持select/search/datepicker，使用方通过传入配置数组来注册

## 相关代码定位

### 1. Skeleton主题配置

- 位置: `src/styles/theme.ts`
- 当前状态: 未配置skeleton组件样式
- 需要: 在theme中添加skeleton的recipe配置，使用主题色（矩阵绿、碳灰等）

### 2. 确认对话框

- 位置:
  - `src/components/log/goal-detail-drawer.tsx` (line 38-49): handleAbandon和handleDelete使用原生confirm
  - `src/components/log/record-detail-drawer.tsx` (line 47-53): handleDelete使用原生confirm
- 需要: 使用Chakra的Dialog或AlertDialog组件替换原生confirm

### 3. 页面紧凑化

- 位置:
  - `src/app/dashboard/page.tsx`: Container py={6}
  - `src/app/log/page.tsx`: Container py={6}, VStack gap={6}
  - `src/components/goals/goal-list.tsx`: SimpleGrid gap={4}
  - `src/components/history/history-list.tsx`: VStack gap={4}
- 需要: 减少padding和gap值，使布局更紧凑

### 4. Chat全局组件

- 位置:
  - `src/app/chat/page.tsx`: 完整的chat页面
  - `src/components/global/global-components.tsx`: 全局组件容器
  - `src/components/layout/authenticated-layout.tsx`: 布局组件
- 需要:
  - 创建浮动chat按钮组件
  - 创建chat模态框/抽屉组件
  - 将chat页面逻辑迁移到全局组件
  - 从路由中移除chat页面

### 5. Records卡片展示

- 位置:
  - `src/components/history/history-list.tsx`: 当前使用Table展示
  - `src/components/goals/goal-card.tsx`: 参考实现
  - `src/app/log/page.tsx`: Records tab使用HistoryList
- 需要:
  - 创建RecordCard组件（类似GoalCard）
  - 创建RecordList组件（类似GoalList，使用SimpleGrid展示卡片）
  - 修改log页面的records tab使用新的RecordList

### 6. 筛选器抽取

- 位置:
  - `src/app/log/page.tsx` (line 139-207): Goals筛选器
  - `src/components/history/history-filters.tsx`: Records筛选器
- 需要:
  - 创建通用FilterBar组件
  - 支持配置数组定义筛选器类型（select/search/datepicker）
  - 在goals/records/notes中复用

## 修改清单

### 主题配置

1. `src/styles/components/skeleton.ts`: 创建skeleton组件样式配置
2. `src/styles/theme.ts`: 添加skeleton到slotRecipes

### 确认对话框

3. `src/components/shared/confirm-dialog.tsx`: 创建可复用的确认对话框组件
4. `src/components/log/goal-detail-drawer.tsx`: 替换confirm为ConfirmDialog
5. `src/components/log/record-detail-drawer.tsx`: 替换confirm为ConfirmDialog

### 页面紧凑化

6. `src/app/dashboard/page.tsx`: 减少Container py和VStack gap
7. `src/app/log/page.tsx`: 减少Container py和VStack gap
8. `src/components/goals/goal-list.tsx`: 减少SimpleGrid gap
9. `src/components/history/history-list.tsx`: 减少VStack gap

### Chat全局组件

10. `src/components/global/chat-button.tsx`: 创建浮动chat按钮
11. `src/components/global/chat-modal.tsx`: 创建chat模态框组件（迁移chat页面逻辑）
12. `src/components/global/global-components.tsx`: 添加ChatButton和ChatModal
13. `src/app/chat/page.tsx`: 删除或标记为废弃

### Records卡片展示

14. `src/components/history/record-card.tsx`: 创建RecordCard组件
15. `src/components/history/record-list.tsx`: 创建RecordList组件（使用卡片网格）
16. `src/app/log/page.tsx`: 修改records tab使用RecordList替代HistoryList

### 筛选器抽取

17. `src/components/shared/filter-bar.tsx`: 创建通用FilterBar组件
18. `src/app/log/page.tsx`: 使用FilterBar替换goals筛选器
19. `src/components/history/history-filters.tsx`: 重构为使用FilterBar
20. `src/app/log/page.tsx`: notes tab添加FilterBar（如果需要）

## 技术要点

- Skeleton主题: 使用Chakra的slotRecipes，配置bg、borderRadius等符合赛博朋克主题
- 确认对话框: 使用Chakra的Dialog.Root，支持自定义标题、内容、确认/取消按钮
- 紧凑化: 统一将py从6改为4，gap从6改为4，gap从4改为3
- Chat全局: 使用fixed定位在右下角，z-index确保在最上层，使用Drawer或Dialog展示chat界面
- Record卡片: 参考GoalCard设计，展示behavior定义名称、图标、metadata摘要、记录时间等
- 筛选器: 使用配置驱动，支持type: 'select' | 'search' | 'datepicker'，通过onChange回调更新筛选状态

