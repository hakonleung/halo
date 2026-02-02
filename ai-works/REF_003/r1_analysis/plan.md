# R1: 分析评估

> REF_003 | 重构 theme 的 slot recipe 的 slots 全部改成 anatomy.keys()

## 目标

将所有使用 `defineSlotRecipe` 的文件中的硬编码 `slots` 数组改为使用对应的 `anatomy.keys()`，提升代码的可维护性和类型安全性。

## 扫描结果

### 已使用 anatomy.keys() 的文件

- `src/styles/components/switch.ts` - 已使用 `switchAnatomy.keys()`

### 需要重构的文件

1. **select.ts**
   - 当前: `slots: ['root', 'trigger', 'positioner', 'content', 'item', 'itemText', 'itemIndicator', 'indicator']`
   - 目标: 使用 `selectAnatomy.keys()`

2. **bottom-nav.ts**
   - 当前: `slots: ['root', 'item', 'icon', 'label']`
   - 目标: 需要确认是否有对应的 anatomy，或使用自定义 anatomy

3. **popover.ts**
   - 当前: `slots: ['content', 'header', 'body', 'footer', 'arrow', 'closeTrigger']`
   - 目标: 使用 `popoverAnatomy.keys()`

4. **card.ts**
   - 当前: `slots: ['root', 'header', 'body', 'footer', 'title', 'description']`
   - 目标: 使用 `cardAnatomy.keys()`

5. **drawer.ts**
   - 当前: `slots: ['backdrop', 'positioner', 'content', 'header', 'title', 'body', 'footer', 'closeTrigger']`
   - 目标: 使用 `drawerAnatomy.keys()`

6. **tabs.ts**
   - 当前: `slots: ['root', 'list', 'trigger', 'content', 'indicator']`
   - 目标: 使用 `tabsAnatomy.keys()`

## 风险评估

- **低风险**: 这是纯技术重构，不改变功能行为
- **类型安全**: 使用 anatomy.keys() 可以确保 slots 与 Chakra UI 官方定义一致
- **兼容性**: 如果某些组件没有对应的 anatomy，可能需要自定义或保持现状

## 重构计划

### Step 1: select.ts
- 导入 `selectAnatomy` from `@chakra-ui/react/anatomy`
- 将 `slots: [...]` 改为 `slots: selectAnatomy.keys()`
- 验证类型检查通过

### Step 2: popover.ts
- 导入 `popoverAnatomy` from `@chakra-ui/react/anatomy`
- 将 `slots: [...]` 改为 `slots: popoverAnatomy.keys()`
- 验证类型检查通过

### Step 3: card.ts
- 导入 `cardAnatomy` from `@chakra-ui/react/anatomy`
- 将 `slots: [...]` 改为 `slots: cardAnatomy.keys()`
- 验证类型检查通过

### Step 4: drawer.ts
- 导入 `drawerAnatomy` from `@chakra-ui/react/anatomy`
- 将 `slots: [...]` 改为 `slots: drawerAnatomy.keys()`
- 验证类型检查通过

### Step 5: tabs.ts
- 导入 `tabsAnatomy` from `@chakra-ui/react/anatomy`
- 将 `slots: [...]` 改为 `slots: tabsAnatomy.keys()`
- 验证类型检查通过

### Step 6: bottom-nav.ts
- 检查是否有对应的 anatomy
- 如果没有，考虑创建自定义 anatomy 或保持现状
- 如果有，使用对应的 anatomy.keys()

## 验证步骤

每步重构后需要：
1. 运行 `pnpm ts-check` 确保类型检查通过
2. 运行 `pnpm lint` 确保代码规范
3. 检查运行时是否正常工作

