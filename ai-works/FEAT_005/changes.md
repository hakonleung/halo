# FEAT_005: Textarea 和 Note 接入开源编辑器

## 修改清单

### 1. 安装依赖

- 新增 `react-markdown@10.1.0` - Markdown 渲染库
- 新增 `remark-gfm@4.0.1` - GitHub Flavored Markdown 支持
- 新增 `@tiptap/react@3.18.0` - 富文本编辑器核心库
- 新增 `@tiptap/starter-kit@3.18.0` - TipTap 基础扩展包
- 新增 `@tiptap/extension-placeholder@3.18.0` - 占位符扩展
- 新增 `@tiptap/extension-link@3.18.0` - 链接扩展
- 新增 `@tiptap/extension-image@3.18.0` - 图片扩展

### 2. 新建组件

#### `src/components/shared/markdown-editor.tsx`
- 可复用的编辑器组件，支持三种模式
- 支持 markdown、text、rich text 三种模式切换
- Markdown 模式：使用 Textarea + Markdown 预览
- Text 模式：使用 Textarea 纯文本编辑
- Rich Text 模式：使用 TipTap 富文本编辑器（WYSIWYG）
- Desktop (> 1024px): 左右分屏显示编辑和预览
- Mobile (≤ 1024px): Tab 切换编辑和预览
- 使用 `react-markdown` 和 `remark-gfm` 进行 Markdown 渲染
- 使用 `@tiptap/react` 进行富文本编辑
- 自定义样式适配项目主题

#### `src/components/shared/markdown-editor-modal.tsx`
- 全屏编辑器 Modal 组件
- 基于 Chakra UI Drawer 实现全屏模式
- 支持保存和取消操作
- 关闭时恢复原始值

### 3. 修改表单组件

#### `src/components/forms/note-form.tsx`
- 将 content 字段的 Textarea 改为只读触发器
- 点击时打开全屏编辑器
- 集成 MarkdownEditorModal 组件

#### `src/components/behaviors/record-form.tsx`
- 将 note 字段的 Textarea 改为只读触发器
- 将 metadata 中 textarea 类型字段的 Textarea 改为只读触发器
- 添加编辑器状态管理（支持 note 和 metadata 两种类型）
- 集成 MarkdownEditorModal 组件

#### `src/components/forms/goal-form.tsx`
- 将 description 字段的 Textarea 改为只读触发器
- 点击时打开全屏编辑器
- 集成 MarkdownEditorModal 组件

## 技术实现

### 响应式布局

- Desktop: 使用 `HStack` 实现左右分屏（编辑 | 预览）
- Mobile: 使用 `Tabs` 实现 Tab 切换（编辑 / 预览）
- 通过 Chakra UI 的响应式断点 `{ base: 'flex', lg: 'none' }` 控制显示

### Markdown 渲染

- 使用 `react-markdown` 进行 Markdown 渲染
- 使用 `remark-gfm` 支持 GitHub Flavored Markdown
- 自定义 CSS 样式适配项目主题（矩阵绿、赛博朋克风格）

### 编辑器功能

- 支持三种模式切换：
  - **Markdown 模式**：使用 Textarea 编辑 Markdown 语法，支持实时预览
  - **Text 模式**：纯文本编辑，无格式化
  - **Rich Text 模式**：WYSIWYG 富文本编辑，支持格式化工具栏
- 全屏编辑模式
- 实时预览（Desktop 左右分屏，Mobile Tab 切换，仅 Markdown 模式）
- 保存和取消操作
- 关闭时恢复原始值
- 富文本编辑器支持：粗体、斜体、标题、列表、链接、图片等

## 修改的文件

1. `package.json` - 新增依赖
2. `src/components/shared/markdown-editor.tsx` - 新建
3. `src/components/shared/markdown-editor-modal.tsx` - 新建
4. `src/components/forms/note-form.tsx` - 修改
5. `src/components/behaviors/record-form.tsx` - 修改
6. `src/components/forms/goal-form.tsx` - 修改

## 验证

- 类型检查通过 (`pnpm ts-check`)
- Lint 检查通过 (`pnpm lint`)
- 所有类型断言已修复，使用类型守卫替代

## 更新记录

### 2024-XX-XX: 添加富文本编辑模式

- 新增 TipTap 富文本编辑器支持
- 添加 Rich Text 模式，支持 WYSIWYG 编辑
- 支持三种模式切换：Markdown、Text、Rich Text
- 富文本编辑器支持格式化工具栏和常用功能

