# Quick Analysis - UI_006

## 需求描述
`new record` 的 `select` 类型元数据字段需要渲染成 Chakra UI 的 `Select` 组件。

## 定位相关代码
- `src/components/global/action/record-form.tsx`: 记录表单组件，负责渲染元数据字段。
- `src/types/behavior-server.ts`: 定义了 `SelectMetadataField` 类型。

## 修改清单
1. 在 `src/components/global/action/record-form.tsx` 中：
   - 识别 `field.type === 'select'`。
   - 使用 `createListCollection` 为每个 `select` 字段创建 collection。
   - 渲染 `Select.Root` 及其子组件。
   - 处理单选和多选（如果需要，先实现单选）。

## 验证计划
1. 在 UI 中创建一个带有 `select` 元数据的 behavior definition。
2. 打开 `RecordForm`，检查该字段是否渲染为 `Select` 组件。
3. 选择一个选项并保存，验证数据是否正确传递。
4. 运行 `pnpm tsc --noEmit` 检查类型。

