# 快速分析：AI Setting 支持自定义 Provider URL

## 需求理解

**需求描述**: AI setting 支持自定义的 provider url

**需求类型**: 小功能迭代 (FEAT)

**具体要求**:
- 允许用户在 AI 设置中配置自定义的 Provider API URL
- 当用户提供自定义 URL 时，使用该 URL 替代默认的 API 端点
- 支持所有 Provider（OpenAI、Anthropic、Google）

## 相关代码定位

### 类型定义
- `src/types/settings-server.ts`: 定义 `AISettings` 接口（服务端类型）
- `src/types/settings-client.ts`: 定义客户端类型（复用服务端类型）

### UI 组件
- `src/components/settings/ai-settings.tsx`: AI 设置界面组件

### 业务逻辑
- `src/lib/agents/factory.ts`: LLM 实例创建工厂，需要支持自定义 URL
- `src/lib/internal-api/settings.ts`: 设置数据转换逻辑

### 数据库
- `src/db/schema.ts`: 数据库 schema，`ai_settings` 字段为 JSONB，无需迁移

## 修改清单

### 1. 类型定义修改
- [x] 在 `AIProvider` enum 中添加 `Custom = 'custom'` 选项
- [x] 在 `customKeys` 数组项中添加 `url?: string | null` 字段
- [x] 更新 `convertAISettings` 函数，支持解析 `customKeys` 中的 `url` 字段

### 2. UI 组件修改
- [x] 在 Provider 下拉中添加 "Custom" 选项
- [x] 当选择 Custom provider 时，显示 URL 输入框（从 `customKeys` 读取）
- [x] 当选择 Custom provider 时，Model 选择器改为文本输入框
- [x] 在 Custom API Keys 列表中，Custom provider 显示 URL 输入框而非 API Key 输入框
- [x] 选择 Custom provider 时自动创建对应的 `customKeys` 项

### 3. Factory 逻辑修改
- [x] 在 `createLLM` 函数中，从 `customKeys` 查找 `provider === 'custom'` 的项
- [x] 如果找到且 `url` 存在，使用其 URL 作为 `baseURL`
- [x] 当 `selectedProvider === Custom` 时，使用 OpenAI 兼容格式创建实例
- [x] 所有 Provider 都支持通过 Custom 项设置自定义 URL

### 4. 数据库默认值更新
- [x] 移除 `ai_settings` 默认值中的 `customProviderUrl` 字段

## 技术细节

### LangChain 自定义 URL 支持
- `ChatOpenAI`: 支持 `configuration.baseURL` 参数
- `ChatAnthropic`: 支持 `configuration.baseURL` 参数
- `ChatGoogleGenerativeAI`: 支持 `configuration.baseURL` 参数

### URL 验证
- 前端：使用 HTML5 `url` 类型输入框进行基本验证
- 后端：可选添加 URL 格式验证（当前阶段可暂不实现）

## 预期影响范围

- 修改文件数: 4-5 个
- 新增 API: 0 个
- 新增数据表: 0 个
- 新增页面: 0 个

符合轻量工作流条件，无需升级到完整模式。

