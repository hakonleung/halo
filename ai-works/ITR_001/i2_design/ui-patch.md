# ITR_001: Chat 功能增强 - UI 设计补丁

> 补丁类型: UI 增强 | 版本: v1.1 | 创建时间: 2026-02-03

## 1. UI 组件补丁

### 1.1 Conversation 列表项增强

**原有设计**:
```
[ Icon ] Title
```

**新设计**:
```
[ Icon ] Title                    [ Edit ] [ Delete ]
         ↑ 点击后变为 input 框           ↑ 悬停显示
```

**交互状态**:
- **正常态**: 显示标题 + 悬停显示操作按钮
- **编辑态**: 标题变为 input 框，显示保存/取消按钮
- **Loading 态**: 禁用操作按钮

**视觉规范**:
```tsx
// 正常态
<HStack>
  <MessageSquare size={16} />
  <Text>{title}</Text>
  <IconButton icon={<Edit size={14} />} /> {/* 悬停显示 */}
  <IconButton icon={<Trash size={14} />} /> {/* 悬停显示 */}
</HStack>

// 编辑态
<HStack>
  <Input value={title} autoFocus />
  <IconButton icon={<Check size={14} />} /> {/* 保存 */}
  <IconButton icon={<X size={14} />} /> {/* 取消 */}
</HStack>
```

**样式**:
- 编辑按钮：`color: text.mist`, hover: `color: brand.cyber`
- 删除按钮：`color: text.mist`, hover: `color: brand.alert`
- Input 框：`bg: bg.carbon`, `border: 1px solid brand.matrix`

### 1.2 删除确认对话框

**组件**: Chakra AlertDialog

**设计**:
```
┌─────────────────────────────┐
│ ⚠️  DELETE CONVERSATION     │
├─────────────────────────────┤
│                             │
│ Are you sure you want to    │
│ delete this conversation?   │
│                             │
│ All messages will be lost.  │
│ This action cannot be       │
│ undone.                     │
│                             │
│     [ CANCEL ]  [ DELETE ]  │
└─────────────────────────────┘
```

**样式**:
- 背景：`bg.carbon`
- 边框：`1px solid brand.alert`
- 标题：`color: brand.alert`, `fontFamily: heading`
- 正文：`color: text.neon`
- Cancel 按钮：`variant: ghost`
- Delete 按钮：`bg: brand.alert`, `color: bg.deep`

### 1.3 消息加载骨架屏

**设计**:
```
┌─────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░        │  ← AI 消息骨架（左侧）
│ ░░░░░░░░░░░░░              │
│                             │
│        ░░░░░░░░░░░░░░░░░░░ │  ← 用户消息骨架（右侧）
│              ░░░░░░░░░░░░░ │
└─────────────────────────────┘
```

**组件**: Chakra Skeleton

**样式**:
```tsx
<VStack gap={6}>
  <HStack align="start" gap={4} w="full">
    <Skeleton.Circle size={10} />
    <Skeleton.Rectangle h="60px" flex={1} />
  </HStack>
  <HStack align="start" gap={4} w="full" justify="end">
    <Skeleton.Rectangle h="60px" flex={1} />
    <Skeleton.Circle size={10} />
  </HStack>
</VStack>
```

### 1.4 用户消息右对齐

**原有设计** (左对齐):
```
[ Avatar ] Message
```

**新设计** (右对齐):
```
                    Message [ Avatar ]
```

**代码示例**:
```tsx
// 用户消息
<HStack justify="end" gap={4}>
  <Box bg="brand.cyber" p={4} borderRadius="4px" maxW="70%">
    <Text>{content}</Text>
  </Box>
  <Avatar name="U" bg="brand.cyber" />
</HStack>

// AI 消息（保持左侧）
<HStack justify="start" gap={4}>
  <Avatar name="AI" bg="brand.matrix" />
  <Box bg="rgba(0, 255, 65, 0.05)" p={4} borderRadius="4px" maxW="70%">
    <ChatMarkdown content={content} />
  </Box>
</HStack>
```

**样式差异**:
- 用户消息背景：`brand.cyber` (电光蓝)
- AI 消息背景：`rgba(0, 255, 65, 0.05)` (矩阵绿透明)
- 用户头像：`bg: brand.cyber`
- AI 头像：`bg: brand.matrix`

### 1.5 AI 生成标题 Loading 提示

**位置**: Conversation 列表项标题处

**设计**:
```
[ Icon ] Generating title... ✨
```

**样式**:
- 文字：`color: text.mist`, `fontStyle: italic`
- 图标：`animation: pulse 1s infinite`

## 2. 响应式设计补丁

### 2.1 移动端优化

**Conversation 列表**:
- Mobile: 全屏显示列表，点击进入对话全屏
- Tablet/Desktop: 侧边栏显示列表

**操作按钮**:
- Mobile: 长按显示操作菜单（删除/重命名）
- Desktop: 悬停显示操作按钮

## 3. 动画与过渡

### 3.1 编辑态切换

```css
transition: all 0.2s ease-in-out
```

### 3.2 确认对话框

```css
fadeIn: {
  from: { opacity: 0, scale: 0.95 }
  to: { opacity: 1, scale: 1 }
  duration: 150ms
}
```

### 3.3 消息加载

```css
skeleton: {
  animation: pulse 1.5s infinite
}
```

## 4. 可访问性

### 4.1 ARIA 标签

- 编辑按钮：`aria-label="Edit conversation title"`
- 删除按钮：`aria-label="Delete conversation"`
- 确认对话框：`role="alertdialog"`

### 4.2 键盘导航

- Tab: 聚焦到操作按钮
- Enter: 编辑态保存
- Escape: 编辑态取消

### 4.3 对比度

- 所有文字与背景对比度 ≥ 4.5:1
- 删除按钮使用 `brand.alert` 确保警示性

## 5. 空状态设计

### 5.1 无 Conversation

```
┌─────────────────────────────┐
│                             │
│    💬                       │
│    NO CONVERSATIONS YET     │
│                             │
│    Click "NEW CHAT" to      │
│    start a conversation     │
│                             │
└─────────────────────────────┘
```

### 5.2 加载失败

```
┌─────────────────────────────┐
│    ⚠️                        │
│    FAILED TO LOAD MESSAGES  │
│                             │
│    [ RETRY ]                │
└─────────────────────────────┘
```

---

**设计完成时间**: 2026-02-03  
**设计人**: AI Assistant

