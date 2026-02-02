# 实现记录

> OPT_001 | 添加 feature flag 模块并关闭 notifications 功能

## 修改文件清单

### 新建文件

1. `src/utils/feature-flags.ts`
   - 创建 feature flag 模块
   - 定义 `FeatureFlag` enum 类型
   - 定义 `featureFlags` 配置对象
   - 导出 `isFeatureEnabled` 函数用于检查功能是否启用
   - 默认关闭 `notifications` 功能

### 修改文件

1. `src/components/settings/settings-page-content.tsx`
   - 导入 feature flag 工具函数
   - 使用 `useMemo` 根据 feature flag 过滤标签页列表
   - 使用 `useEffect` 监听 feature flag 变化，如果当前激活的是通知标签页但功能被关闭，自动切换到第一个可用标签页
   - 在 `renderContent` 中检查 feature flag，如果通知功能被关闭则不渲染通知设置组件

## 实现细节

### Feature Flag 模块

- 使用 enum 类型确保类型安全
- 配置对象使用 `Record<FeatureFlag, boolean>` 类型
- `isFeatureEnabled` 函数提供统一的检查接口
- 易于扩展，添加新功能只需在 enum 和配置对象中添加新项

### 设置页面集成

- 使用 `useMemo` 缓存过滤后的标签页列表，避免不必要的重新计算
- 使用 `useEffect` 处理标签页切换逻辑，确保用户体验流畅
- 双重保护：在标签页列表和内容渲染两个层面都检查 feature flag

## 验证结果

- TypeScript 类型检查：通过
- ESLint 检查：通过
- 功能测试：待手动测试

