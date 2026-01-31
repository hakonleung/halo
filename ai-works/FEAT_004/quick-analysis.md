# FEAT_004: 修改 goal / record / definition 的展示页面

## 需求理解

### 核心需求

1. **URL Query 参数管理**
   - 点击 goal/record/definition 时，添加 query 参数到 URL
   - 例如：`?goal=xxx`, `?record=xxx`, `?definition=xxx`

2. **全局 Detail Drawers**
   - 自动检测 URL query 参数
   - 显示 goal 和 record 的详情
   - Record drawer 显示 record 和 definition，均可进入编辑模式
   - Goal drawer 显示 goal，可进入编辑模式

3. **页面合并**
   - 合并 goals 和 history 页面成 LOG 页面
   - LOG 页面作为 app 的默认页面（替换 dashboard）
   - LOG 页面分区展示：goals / records / notes

4. **新增 Note 功能**
   - 在 action drawer 中添加 "Note" tab
   - 支持创建 note

## 相关代码定位

### 核心文件

1. **`src/app/page.tsx`** - 根页面，需要改为重定向到 `/log`
2. **`src/app/goals/page.tsx`** - Goals 页面，需要合并到 LOG 页面
3. **`src/app/history/page.tsx`** - History 页面，需要合并到 LOG 页面
4. **`src/app/dashboard/page.tsx`** - Dashboard 页面，不再是默认页面
5. **`src/components/history/history-list.tsx`** - History 列表，需要添加点击事件
6. **`src/components/goals/goal-list.tsx`** - Goal 列表，需要修改点击行为
7. **`src/components/shared/action-button.tsx`** - Action drawer，需要添加 Note tab
8. **`src/components/shared/action-drawer-context.tsx`** - Drawer context，需要扩展支持 detail drawers

### 需要新建的文件

1. **`src/app/log/page.tsx`** - 新的 LOG 页面
2. **`src/components/log/goal-detail-drawer.tsx`** - Goal 详情 drawer
3. **`src/components/log/record-detail-drawer.tsx`** - Record 详情 drawer
4. **`src/components/log/definition-detail-drawer.tsx`** - Definition 详情 drawer（可选，可能在 record drawer 内）
5. **`src/components/log/note-form.tsx`** - Note 创建表单
6. **`src/components/log/log-tabs.tsx`** - LOG 页面的 tabs（goals/records/notes）
7. **`src/hooks/use-url-query.ts`** - URL query 参数管理 hook
8. **`src/hooks/use-notes.ts`** - Notes 相关 hooks（如果不存在）

## 修改清单

### 1. URL Query 管理

**新建**: `src/hooks/use-url-query.ts`
- 使用 `useSearchParams` 和 `useRouter` 管理 URL query
- 提供 `setQuery`, `getQuery`, `removeQuery` 方法
- 支持 `goal`, `record`, `definition` 参数

### 2. 全局 Detail Drawers

**新建**: `src/components/log/detail-drawer-provider.tsx`
- 创建全局 context 管理 detail drawers
- 监听 URL query 参数变化
- 自动打开对应的 drawer

**新建**: `src/components/log/goal-detail-drawer.tsx`
- 显示 goal 详情
- 支持编辑模式
- 使用 `useGoal` hook 获取数据

**新建**: `src/components/log/record-detail-drawer.tsx`
- 显示 record 详情
- 显示关联的 definition 详情
- 支持编辑 record 和 definition
- 使用 tabs 切换 record 和 definition 视图

### 3. 修改点击行为

**修改**: `src/components/history/history-list.tsx`
- Edit 按钮点击时，添加 query 参数到 URL
- 根据 item.type 设置对应的 query（goal/record）

**修改**: `src/components/goals/goal-list.tsx` / `src/components/goals/goal-card.tsx`
- 点击 goal 时，添加 `?goal=xxx` 到 URL
- 移除原有的路由跳转

### 4. 创建 LOG 页面

**新建**: `src/app/log/page.tsx`
- 合并 goals 和 history 页面的功能
- 使用 tabs 展示三个分区：Goals / Records / Notes
- 每个 tab 显示对应的列表

**新建**: `src/components/log/log-tabs.tsx`
- LOG 页面的 tabs 组件
- 三个 tab：Goals, Records, Notes

**删除/归档**: 
- `src/app/goals/page.tsx` - 功能合并到 LOG 页面
- `src/app/history/page.tsx` - 功能合并到 LOG 页面

### 5. 修改默认页面

**修改**: `src/app/page.tsx`
- 重定向到 `/log` 而不是 `/dashboard`

**修改**: `src/components/layout/bottom-navbar.tsx`（如果需要）
- 更新导航链接，指向 `/log`

### 6. 新增 Note 功能

**新建**: `src/components/log/note-form.tsx`
- Note 创建表单
- 参考 `GoalForm` 和 `RecordForm` 的结构

**修改**: `src/components/shared/action-button.tsx`
- 添加 "Note" tab
- 显示 `NoteForm` 组件

**检查**: `src/hooks/use-notes.ts`
- 如果不存在，需要创建
- 包含 `useNotes`, `useCreateNote` 等 hooks

**检查**: Note API
- 检查 `/api/notes` 路由是否存在
- 如果不存在，需要创建

### 7. 编辑模式

**修改**: Goal/Record/Definition detail drawers
- 添加编辑模式切换
- 编辑模式下显示表单
- 使用现有的 update hooks

## 技术要点

### URL Query 管理

使用 Next.js 的 `useSearchParams` 和 `useRouter`:
```typescript
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const setQuery = (key: string, value: string | null) => {
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  router.push(`${pathname}?${params.toString()}`);
};
```

### Detail Drawer 自动检测

在 `DetailDrawerProvider` 中：
```typescript
useEffect(() => {
  const goalId = searchParams.get('goal');
  const recordId = searchParams.get('record');
  const definitionId = searchParams.get('definition');
  
  if (goalId) {
    openGoalDrawer(goalId);
  } else if (recordId) {
    openRecordDrawer(recordId);
  } else if (definitionId) {
    openDefinitionDrawer(definitionId);
  }
}, [searchParams]);
```

### LOG 页面结构

```
LOG Page
├── Tabs (Goals / Records / Notes)
├── Goals Tab
│   ├── Filters
│   └── GoalList
├── Records Tab
│   ├── Filters
│   └── HistoryList (filtered by records)
└── Notes Tab
    ├── Filters
    └── NoteList
```

### 编辑模式实现

- 使用 state 管理编辑模式：`const [isEditing, setIsEditing] = useState(false)`
- 编辑模式下显示表单，否则显示详情
- 保存后退出编辑模式并刷新数据

## 实现顺序

1. 创建 URL query 管理 hook
2. 创建 Detail Drawer Provider 和 drawers
3. 修改点击行为，添加 query 参数
4. 创建 LOG 页面和 tabs
5. 修改默认页面重定向
6. 添加 Note 功能（表单、API、hooks）
7. 实现编辑模式
8. 测试和验证

## 注意事项

- 保持 URL 和 drawer 状态同步
- 关闭 drawer 时清除 URL query
- 编辑模式下的表单验证
- Note 功能需要检查 API 是否已存在
- 合并页面时保持原有功能不变
- 响应式设计：移动端和桌面端的 tabs 布局

