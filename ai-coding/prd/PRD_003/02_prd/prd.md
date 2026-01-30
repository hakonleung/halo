# PRD_003 产品需求文档：赛博朋克风格样式重构

## 1. 概述

### 背景

NEO-LOG 项目需要升级视觉体验，从当前简单的样式系统重构为具有层次感、科技感的赛博朋克风格，以匹配"AI 原生个人生活追踪系统"的品牌定位。

### 目标

1. 重构 Chakra UI 主题配置，建立完整的设计令牌系统
2. 为核心组件创建具有赛博朋克风格的 Recipe
3. 实现毛玻璃、发光、动画等视觉效果
4. 确保样式系统的可维护性和可扩展性

### 成功指标

| 指标 | 目标值 |
|------|--------|
| 组件 Recipe 覆盖率 | 100% 核心组件 |
| 视觉一致性 | 与设计规范匹配度 ≥ 95% |
| 动画性能 | FPS ≥ 55 |
| 字体加载影响 | LCP < 100ms |

## 2. 用户故事

### US-001: 主题字体配置

**优先级**: P0

> 作为开发者，我希望主题使用 Orbitron/Rajdhani 字体，以便界面呈现科幻未来感。

**验收标准**:
- AC-001-1: Given 页面加载完成，When 查看标题文字，Then 字体为 Orbitron
- AC-001-2: Given 页面加载完成，When 查看正文文字，Then 字体为 Rajdhani
- AC-001-3: Given 字体加载失败，When 查看任意文字，Then 回退到 SF Pro Display 或系统字体

### US-002: 毛玻璃弹出组件

**优先级**: P0

> 作为用户，我希望弹出式组件（抽屉、下拉、卡片）使用毛玻璃效果，以便感知界面层次。

**验收标准**:
- AC-002-1: Given 打开 Drawer，When 查看背景，Then 可见 16-20px 模糊效果
- AC-002-2: Given 打开 Select 下拉，When 查看下拉面板，Then 可见毛玻璃效果
- AC-002-3: Given 查看 Card 组件，When 有背景内容，Then 透过卡片可见模糊背景
- AC-002-4: Given 浏览器不支持 backdrop-filter，When 查看组件，Then 显示半透明纯色背景

### US-003: 按钮发光效果

**优先级**: P0

> 作为用户，我希望按钮有发光和脉冲效果，以便获得科技感的交互反馈。

**验收标准**:
- AC-003-1: Given Primary 按钮，When 鼠标悬停，Then 显示脉冲发光动画
- AC-003-2: Given Secondary 按钮，When 查看边框，Then 有矩阵绿发光效果
- AC-003-3: Given Danger 按钮，When 查看边框，Then 有霓虹红发光效果

### US-004: 输入框聚焦效果

**优先级**: P0

> 作为用户，我希望输入框聚焦时有发光边框，以便清晰感知当前焦点。

**验收标准**:
- AC-004-1: Given 输入框未聚焦，When 查看边框，Then 边框为暗灰色
- AC-004-2: Given 输入框聚焦，When 查看边框，Then 边框变为矩阵绿并有外发光
- AC-004-3: Given 输入框有错误，When 查看边框，Then 边框变为霓虹红

### US-005: 底部导航毛玻璃

**优先级**: P0

> 作为移动端用户，我希望底部导航栏使用毛玻璃效果，以便在滚动时保持层次感。

**验收标准**:
- AC-005-1: Given 移动端视图，When 查看底部导航，Then 背景为毛玻璃效果
- AC-005-2: Given 选中某导航项，When 查看图标，Then 图标有发光指示
- AC-005-3: Given 页面滚动，When 内容经过底部导航，Then 可见模糊的背景内容

### US-006: 发光脉冲动画

**优先级**: P0

> 作为用户，我希望交互元素有呼吸灯式的脉冲动画，以便界面更有活力。

**验收标准**:
- AC-006-1: Given 按钮悬停，When 动画播放，Then 发光强度周期性变化
- AC-006-2: Given 卡片悬停，When 动画播放，Then 边框发光强度增加
- AC-006-3: Given 系统开启 reduced-motion，When 查看动画，Then 动画被禁用

### US-007: Glitch 故障动画

**优先级**: P1

> 作为用户，我希望点击反馈使用 Glitch 效果，以便体验赛博朋克风格。

**验收标准**:
- AC-007-1: Given 点击按钮，When 动画触发，Then 元素有像素抖动效果
- AC-007-2: Given 显示错误提示，When 动画触发，Then 文字有 Glitch 效果
- AC-007-3: Given 动画播放，When 测量时长，Then 持续 100-200ms

### US-008: 扫描线动画

**优先级**: P1

> 作为用户，我希望背景和卡片有扫描线装饰，以便增强科幻 HUD 氛围。

**验收标准**:
- AC-008-1: Given 页面加载完成，When 查看背景，Then 可见水平扫描线动画
- AC-008-2: Given 卡片组件，When 启用扫描线，Then 边缘有扫描线装饰
- AC-008-3: Given 扫描线动画，When 测量周期，Then 为 3-5 秒

### US-009: 标签/徽章样式

**优先级**: P1

> 作为用户，我希望标签和徽章有发光边框和半透明背景，以便与整体风格一致。

**验收标准**:
- AC-009-1: Given 标签组件，When 查看外观，Then 背景为半透明主色
- AC-009-2: Given 标签组件，When 查看边框，Then 有 1px 发光边框
- AC-009-3: Given 不同类型标签，When 查看颜色，Then 与语义色匹配（成功/警告/错误/信息）

### US-010: 颜色令牌扩展

**优先级**: P0

> 作为开发者，我希望主题包含完整的颜色令牌（含透明度变体），以便一致地应用样式。

**验收标准**:
- AC-010-1: Given 主色令牌，When 使用变体，Then 可用 10%-90% 透明度版本
- AC-010-2: Given 语义色令牌，When 引用，Then 包含 success/warning/error/info
- AC-010-3: Given 毛玻璃令牌，When 引用，Then 包含标准背景和边框颜色

## 3. 功能规格

### 3.1 主题系统

- 支持字体配置：标题字体、正文字体、代码字体
- 支持颜色令牌：主色、背景色、文字色、语义色、透明度变体
- 支持动画配置：keyframes 定义、持续时间、缓动函数
- 支持毛玻璃预设：背景、边框、模糊度

### 3.2 组件 Recipe

**核心组件** (Must Have):
- Button: primary/secondary/danger/ghost 变体，发光效果，脉冲动画
- Input: outline/solid/subtle 变体，聚焦发光，错误状态
- Select: 毛玻璃下拉面板，发光边框
- Drawer: 毛玻璃背景，边缘光晕
- Card: 毛玻璃效果，hover 发光，边角装饰
- Badge: 半透明背景，发光边框

**扩展组件** (Nice to Have):
- BottomNav: 毛玻璃背景，图标发光
- Popover/Menu: 毛玻璃效果
- Toast: 毛玻璃背景，语义色边框

### 3.3 动画系统

- pulse-glow: 呼吸灯发光效果
- glitch: 像素抖动效果
- scan-line: 水平扫描线
- matrix-flow: 矩阵雨效果（Nice to Have）

## 4. 非功能需求

### 性能

- 动画运行时帧率 ≥ 55 FPS
- 字体加载对 LCP 影响 < 100ms
- CSS 文件大小增量 < 20KB (gzip)

### 可用性

- 支持 prefers-reduced-motion 媒体查询
- 文字对比度符合 WCAG AA 标准
- 发光效果不影响内容可读性

### 兼容性

- backdrop-filter: Chrome 76+, Safari 9+, Firefox 103+
- 不支持时优雅降级为半透明纯色

## 5. 约束与依赖

### 技术约束

- 必须使用 Chakra UI v3 的 recipe 系统
- 仅使用 CSS 实现，不引入 JS 动画库
- 字体通过 Google Fonts 或本地文件加载

### 数据依赖

- 无数据库依赖
- 无 API 依赖

### 业务规则

- 仅支持深色模式
- 动画可通过系统设置禁用

## 6. 里程碑

| 阶段 | 产出 |
|------|------|
| 05a | 主题令牌定义、字体配置 |
| 05c | Button/Input/Select Recipe |
| 05c | Drawer/Card/Badge Recipe |
| 05c | 动画系统 (keyframes) |
| 05c | BottomNav/Popover Recipe |
| 06 | 视觉走查、性能测试 |

## 7. 开放问题

| ID | 问题 | 状态 |
|----|------|------|
| Q1 | 字体是否需要本地化部署以提升加载速度？ | 待定 |
| Q2 | 是否需要为低性能设备提供简化版样式？ | 待定 |
