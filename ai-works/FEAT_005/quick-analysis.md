# FEAT_005: Textarea 和 Note 接入开源编辑器

## 需求理解

### 核心需求

1. **Textarea 增强**
   - 点击 textarea 时进入全屏富文本编辑模式
   - 支持 markdown 格式编辑
   - 支持 markdown 预览功能

2. **预览模式**
   - Desktop: 左右分屏（编辑 | 预览）
   - Mobile: Tab 切换（编辑 / 预览）

3. **适用范围**
   - Note 表单的 content 字段
   - Record 表单的 note 字段
   - Record 表单中 metadata 的 textarea 类型字段
   - Goal 表单的 description 字段

## 相关代码定位

### 核心文件

1. **`src/components/forms/note-form.tsx`** - Note 表单，content 字段使用 Textarea
2. **`src/components/behaviors/record-form.tsx`** - Record 表单，note 字段和 metadata textarea 字段
3. **`src/components/forms/goal-form.tsx`** - Goal 表单，description 字段使用 Textarea

### 需要新建的文件

1. **`src/components/shared/markdown-editor.tsx`** - 可复用的 Markdown 编辑器组件
2. **`src/components/shared/markdown-editor-modal.tsx`** - 全屏编辑器 Modal 组件

## 修改清单

### 1. 安装依赖

**新增依赖**:
- `react-markdown` - Markdown 渲染
- `remark-gfm` - GitHub Flavored Markdown 支持（可选）
- `react-syntax-highlighter` - 代码高亮（可选）

### 2. 创建 Markdown 编辑器组件

**新建**: `src/components/shared/markdown-editor.tsx`
- 可复用的 Markdown 编辑器组件
- 支持全屏模式
- Desktop: 左右分屏（编辑 | 预览）
- Mobile: Tab 切换（编辑 / 预览）
- 使用 Chakra UI 组件构建
- 支持 markdown 格式切换

### 3. 创建全屏编辑器 Modal

**新建**: `src/components/shared/markdown-editor-modal.tsx`
- 全屏 Modal 组件
- 点击 textarea 时打开
- 包含编辑器组件
- 支持保存和取消操作

### 4. 修改 Note 表单

**修改**: `src/components/forms/note-form.tsx`
- 将 content 字段的 Textarea 替换为可点击的触发器
- 点击时打开全屏编辑器
- 编辑器支持 markdown 格式

### 5. 修改 Record 表单

**修改**: `src/components/behaviors/record-form.tsx`
- 将 note 字段的 Textarea 替换为可点击的触发器
- 将 metadata 中 textarea 类型字段的 Textarea 替换为可点击的触发器
- 点击时打开全屏编辑器

### 6. 修改 Goal 表单

**修改**: `src/components/forms/goal-form.tsx`
- 将 description 字段的 Textarea 替换为可点击的触发器
- 点击时打开全屏编辑器

## 技术要点

### Markdown 编辑器实现

使用 `react-markdown` 进行渲染：
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

### 响应式布局

- Desktop (> 1024px): 使用 `HStack` 左右分屏
- Mobile (≤ 1024px): 使用 `Tabs` 切换编辑和预览

### 全屏 Modal

使用 Chakra UI 的 `Modal` 组件，设置为全屏：
```typescript
<Modal.Root open={isOpen} onOpenChange={onOpenChange} size="full">
  <Modal.Backdrop />
  <Modal.Content>
    {/* Editor content */}
  </Modal.Content>
</Modal.Root>
```

### Textarea 触发器

保持原有的 Textarea 外观，但添加点击事件：
```typescript
<Textarea
  readOnly
  onClick={() => openEditor()}
  value={value}
  placeholder={placeholder}
  cursor="pointer"
/>
```

## 实现顺序

1. 安装依赖（react-markdown, remark-gfm）
2. 创建 Markdown 编辑器组件（支持响应式布局）
3. 创建全屏编辑器 Modal 组件
4. 修改 Note 表单，接入编辑器
5. 修改 Record 表单，接入编辑器
6. 修改 Goal 表单，接入编辑器
7. 测试和验证

## 注意事项

- 保持原有表单的验证逻辑
- 编辑器需要支持 markdown 和纯文本两种模式
- 响应式布局需要适配移动端和桌面端
- 全屏编辑器需要支持保存和取消操作
- 编辑器内容需要与表单状态同步
- 考虑性能优化，避免频繁渲染 markdown

