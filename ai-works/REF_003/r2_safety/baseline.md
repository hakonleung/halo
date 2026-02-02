# R2: 安全网建立

> REF_003 | 重构 theme 的 slot recipe 的 slots 全部改成 anatomy.keys()

## 基准测试结果

### 类型检查

- 命令: `pnpm ts-check`
- 状态: 通过
- 时间: 重构前

### Lint 检查

- 命令: `pnpm lint`
- 状态: 通过
- 时间: 重构前

### 测试覆盖率

- 项目当前没有单元测试覆盖
- 重构为纯技术重构，不改变功能行为
- 通过类型检查和 lint 检查确保代码质量

## 重构前状态

### 文件清单

- `src/styles/components/switch.ts` - 已使用 `switchAnatomy.keys()`
- `src/styles/components/select.ts` - 使用硬编码 slots
- `src/styles/components/bottom-nav.ts` - 使用硬编码 slots
- `src/styles/components/popover.ts` - 使用硬编码 slots
- `src/styles/components/card.ts` - 使用硬编码 slots
- `src/styles/components/drawer.ts` - 使用硬编码 slots
- `src/styles/components/tabs.ts` - 使用硬编码 slots

## 验证标准

重构后需要满足：
1. 所有文件类型检查通过
2. 所有文件 lint 检查通过
3. 运行时功能正常（通过手动测试验证）

