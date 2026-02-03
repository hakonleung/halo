# 工作流归档报告

> FEAT_008 | AI Setting 支持自定义 Provider URL | completed | 2026-02-03

## 1. 需求是什么

### 背景与痛点

用户希望在 AI 设置中配置自定义的 Provider API URL，以便使用第三方兼容的 API 服务，而不局限于官方的 API 端点。这对于使用代理服务、自建服务或第三方兼容服务的用户非常重要。

### 功能范围

**Must Have**:
- 允许用户在 AI 设置中配置自定义的 Provider API URL
- 当用户提供自定义 URL 时，使用该 URL 替代默认的 API 端点
- 支持所有 Provider（OpenAI、Anthropic、Google）
- 当选择 Custom provider 时，支持输入自定义模型名

**Nice to Have**:
- URL 格式验证（前端使用 HTML5 验证）

**不做**:
- 后端 URL 格式验证（当前阶段）
- 自定义 API 认证方式（使用标准 API Key）

### 成功指标

- 用户可以在 UI 中输入和保存自定义 URL
- LLM 实例创建时正确使用自定义 URL
- 类型检查和 Lint 检查通过

## 2. 做了什么

### 实现功能

- ✅ 在 `AIProvider` enum 中添加 `Custom` 选项
- ✅ 在 `customKeys` 数组项中添加 `url` 字段
- ✅ 更新 UI 组件，支持选择 Custom provider 并输入 URL
- ✅ 当选择 Custom provider 时，Model 选择器改为文本输入框
- ✅ 在 Custom API Keys 列表中显示 URL 输入框（Custom provider）
- ✅ 更新 Factory 逻辑，从 `customKeys` 读取自定义 URL 并传递给 LangChain
- ✅ 移除旧的 `customProviderUrl` 字段，统一使用 `customKeys` 结构

### 代码统计

- 修改文件: 5 个
  - `src/types/settings-server.ts` - 类型定义
  - `src/lib/internal-api/settings.ts` - 数据转换逻辑
  - `src/db/schema.ts` - 数据库 Schema
  - `src/components/settings/ai-settings.tsx` - UI 组件
  - `src/lib/agents/factory.ts` - Factory 逻辑
- 新增 API: 0 个
- 新增数据表: 0 个

### 技术实现细节

**数据结构**:
- 使用 `customKeys` 数组统一管理所有 Provider 的自定义配置
- 数组项结构：`{ provider: string, hasKey: boolean, url?: string | null }`

**LangChain 配置方式**:
- 所有 Provider 都支持 `configuration.baseURL` 参数
- Custom provider 使用 OpenAI 兼容的 API 格式（ChatOpenAI）

**数据流**:
1. 用户选择 Provider 或 Custom
2. 系统自动在 `customKeys` 中创建对应项
3. 用户输入 URL 和模型名
4. 通过 API 保存到数据库的 `ai_settings` JSONB 字段
5. 创建 LLM 实例时从 `customKeys` 中查找并使用自定义 URL

## 3. 还有什么没做

### 未实现功能

- 后端 URL 格式验证（当前仅使用 HTML5 前端验证）
- 端到端功能测试（需要手动测试）
- 边界情况测试（空字符串、无效 URL 格式等）

### 待改进项

- 添加 URL 连接测试功能（测试用户输入的 URL 是否可用）
- 添加 API 响应格式验证（确保用户的自定义服务兼容）
- 添加自动化集成测试

### 技术债务

无

## 4. 质量如何

### 验证结果

- ✅ 类型检查通过 (`pnpm tsc --noEmit`)
- ✅ Lint 检查通过 (`pnpm lint --fix`)

### 代码质量

- ✅ 类型安全：无 `any`、`as` 等不安全用法
- ✅ 代码简洁：遵循项目代码规范
- ✅ 易于维护：使用统一的 `customKeys` 结构管理所有自定义配置
- ✅ 文件大小合规：所有文件 < 300 行

### 功能完整性

- ✅ 类型定义完整
- ✅ 数据转换正确
- ✅ UI 组件功能齐全
- ✅ Factory 逻辑正确

### 文档同步率

- ✅ 所有修改已记录在 `changes.md`
- ✅ 验证结果已记录在 `validation.md`
- ✅ 快速分析已记录在 `quick-analysis.md`

### 部署状态

未部署（等待手动端到端测试后部署）

