# 快速分析

> OPT_001 | 添加 feature flag 模块并关闭 notifications 功能 | 技术优化

## 需求理解

### 需求 1: 添加 feature flag 模块

**当前状态**:
- 项目中没有 feature flag 系统
- 功能开关需要硬编码或通过配置管理

**期望状态**:
- 创建统一的 feature flag 模块
- 支持通过配置控制功能开关
- 类型安全，易于扩展

### 需求 2: 关闭 notifications 功能

**当前状态**:
- `src/components/settings/notification-settings.tsx` 显示通知设置
- `src/components/settings/settings-page-content.tsx` 包含通知标签页
- 数据库 schema 中有通知相关字段

**期望状态**:
- 通过 feature flag 控制通知功能的显示
- 当 feature flag 关闭时，隐藏通知设置标签页和相关组件
- 不影响数据库结构，仅控制 UI 显示

## 相关代码定位

### 文件清单

1. **Feature Flag 模块**
   - `src/utils/feature-flags.ts` - 需要新建，定义 feature flags 配置

2. **设置页面**
   - `src/components/settings/settings-page-content.tsx` - 需要根据 feature flag 过滤标签页

3. **通知设置组件**
   - `src/components/settings/notification-settings.tsx` - 可能需要在组件内部也检查 feature flag

## 修改清单

### 1. 创建 Feature Flag 模块

- [ ] 创建 `src/utils/feature-flags.ts`
  - 定义 `FeatureFlag` enum 类型
  - 定义 `FeatureFlags` 配置对象
  - 导出 `isFeatureEnabled` 函数用于检查功能是否启用
  - 默认关闭 `notifications` 功能

### 2. 修改设置页面

- [ ] 修改 `src/components/settings/settings-page-content.tsx`
  - 导入 feature flag 工具函数
  - 在 `tabs` 数组中根据 feature flag 过滤通知标签页
  - 在 `renderContent` 中根据 feature flag 决定是否渲染通知设置组件
  - 如果当前激活的是通知标签页但功能被关闭，自动切换到第一个可用标签页

### 3. 验证

- [ ] 运行 `pnpm tsc --noEmit` 检查类型
- [ ] 运行 `pnpm lint` 检查代码规范
- [ ] 手动测试设置页面，确认通知标签页已隐藏
- [ ] 确认其他功能正常工作

