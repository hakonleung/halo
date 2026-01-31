# FEAT_006 修改记录

## 概述

本次修改完成了以下功能：
1. Skeleton主题配置
2. 确认对话框组件
3. 页面紧凑化
4. Chat全局组件
5. Records卡片展示
6. 通用筛选器组件

## 修改文件清单

### 主题配置

- `src/styles/components/skeleton.ts`: 新增skeleton组件样式配置，支持matrix变体
- `src/styles/tokens/animations.ts`: 新增skeleton-pulse动画
- `src/styles/theme.ts`: 添加skeleton到recipes配置

### 共享组件

- `src/components/shared/confirm-dialog.tsx`: 新增确认对话框组件，使用Chakra Dialog
- `src/components/shared/filter-bar.tsx`: 新增通用筛选器组件，支持select/search/datepicker

### 全局组件

- `src/components/global/chat-button.tsx`: 新增浮动chat按钮组件
- `src/components/global/chat-modal.tsx`: 新增chat模态框组件，迁移chat页面逻辑
- `src/components/global/global-components.tsx`: 添加ChatButton到全局组件

### 历史记录组件

- `src/components/history/record-card.tsx`: 新增RecordCard组件，展示behavior记录卡片
- `src/components/history/record-list.tsx`: 新增RecordList组件，使用卡片网格展示
- `src/components/history/history-filters.tsx`: 重构为使用FilterBar组件

### 详情抽屉

- `src/components/log/goal-detail-drawer.tsx`: 替换原生confirm为ConfirmDialog
- `src/components/log/record-detail-drawer.tsx`: 替换原生confirm为ConfirmDialog

### 页面

- `src/app/dashboard/page.tsx`: 减少padding和gap，使布局更紧凑
- `src/app/log/page.tsx`: 减少padding和gap，使用FilterBar替换goals筛选器，使用RecordList替换HistoryList

### 列表组件

- `src/components/goals/goal-list.tsx`: 减少gap值
- `src/components/history/history-list.tsx`: 减少gap值

## 主要变更

### 1. Skeleton主题

- 配置了符合赛博朋克主题的skeleton样式
- 支持matrix变体，带有矩阵绿边框和发光效果
- 添加了skeleton-pulse动画

### 2. 确认对话框

- 创建了可复用的ConfirmDialog组件
- 支持自定义标题、消息、按钮标签和颜色方案
- 在goal和record的删除/放弃操作中使用

### 3. 页面紧凑化

- Dashboard页面: py从6改为4，gap从6改为4
- Log页面: py从6改为4，gap从6改为4
- GoalList: gap从4改为3
- HistoryList: gap从4改为3

### 4. Chat全局组件

- 创建了浮动在右下角的ChatButton
- 创建了ChatModal组件，包含完整的chat功能
- 从路由中移除了chat页面（保留文件但不再使用）

### 5. Records卡片展示

- 创建了RecordCard组件，参考GoalCard设计
- 创建了RecordList组件，使用SimpleGrid展示卡片网格
- 在log页面的records tab中使用RecordList替代HistoryList

### 6. 通用筛选器

- 创建了FilterBar组件，支持配置驱动的筛选器
- 支持select/search/datepicker三种类型
- 支持紧凑模式
- 重构了goals和records的筛选器使用FilterBar

## 技术细节

### FilterBar配置格式

```typescript
interface FilterConfig {
  key: string;
  type: 'select' | 'search' | 'datepicker';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  value?: string;
  minW?: string;
  maxW?: string;
}
```

### RecordCard展示内容

- Behavior定义名称和图标
- Category标签
- Metadata摘要（最多3个，超出显示"+N more"）
- Note内容（如果有，最多2行）
- 记录时间（相对时间）

### ChatButton定位

- 桌面端: 右下角，距离边缘6px
- 移动端: 右下角，距离底部20px（避免与底部导航重叠），距离右侧4px
- z-index: 1000，确保在最上层

## 验证

- 类型检查通过: `pnpm tsc --noEmit`
- 所有组件已正确导入和使用
- 筛选器功能正常工作
- Chat功能已迁移到全局组件

