# 修改记录：AI Setting 支持自定义 Provider URL

## 修改文件列表

### 1. 类型定义修改

**文件**: `src/types/settings-server.ts`
- 在 `AIProvider` enum 中添加 `Custom = 'custom'` 选项
- 移除 `AISettings` 接口中的 `customProviderUrl` 字段
- 在 `customKeys` 数组项中添加 `url?: string | null` 字段

### 2. 数据转换逻辑修改

**文件**: `src/lib/internal-api/settings.ts`
- 移除 `customProviderUrl` 的解析逻辑
- 更新 `convertAISettings` 函数，支持解析 `customKeys` 中的 `url` 字段

### 3. 数据库 Schema 修改

**文件**: `src/db/schema.ts`
- 移除 `ai_settings` 默认值中的 `customProviderUrl` 字段

### 4. UI 组件修改

**文件**: `src/components/settings/ai-settings.tsx`
- 在 `providerOptions` 中添加 "Custom" 选项
- 在 `modelOptions` 中添加 `Custom` provider 的模型选项
- 移除独立的 `customProviderUrl` 输入框
- 当选择 `Custom` provider 时：
  - 显示 URL 输入框（从 `customKeys` 中读取）
  - Model 选择器改为文本输入框，允许用户输入自定义模型名
- 更新 `handleUpdateCustomKey` 函数，支持 `url` 参数
- 在 Custom API Keys 列表中，当 provider 为 Custom 时显示 URL 输入框而非 API Key 输入框
- 当选择 Custom provider 时，自动在 `customKeys` 中创建对应的项

### 5. Factory 逻辑修改

**文件**: `src/lib/agents/factory.ts`
- 从 `customKeys` 中查找 `provider === AIProvider.Custom` 的项
- 如果找到，使用其 `url` 作为 `baseURL`
- 当 `selectedProvider === AIProvider.Custom` 时：
  - 检查是否存在自定义 URL，不存在则抛出错误
  - 使用 OpenAI 兼容的 API 格式（ChatOpenAI）创建实例
- 所有 Provider 都支持通过 `customKeys` 中的 Custom 项来设置自定义 URL

## 技术实现细节

### 数据结构
- `customKeys` 数组项结构：`{ provider: string, hasKey: boolean, url?: string | null }`
- 当 `provider === 'custom'` 时，`url` 字段存储自定义 Provider 的 baseURL

### LangChain 配置方式
- 使用 `configuration.baseURL` 参数传递自定义 URL
- Custom provider 使用 OpenAI 兼容的 API 格式

### 数据流
1. 用户在 Provider 下拉中选择 "Custom"
2. 系统自动在 `customKeys` 中创建 `{ provider: 'custom', hasKey: false, url: null }` 项
3. 用户输入自定义 URL，保存到 `customKeys` 中对应项的 `url` 字段
4. 用户输入自定义模型名（文本输入框）
5. 通过 API 保存到数据库的 `ai_settings` JSONB 字段
6. 在创建 LLM 实例时，从 `customKeys` 中查找 `provider === 'custom'` 的项
7. 如果找到且 `url` 存在，则传递给 LangChain 的 `configuration.baseURL`

## 验证结果

- 类型检查: 通过 (`pnpm tsc --noEmit`)
- Lint 检查: 通过 (`pnpm lint --fix`)

