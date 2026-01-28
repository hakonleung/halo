# PRD_003 技术设计文档：赛博朋克风格样式重构

## 1. 概述

本项目为纯前端样式重构，不涉及数据库、API 变更。主要技术任务：

- 重构 `src/styles/theme.ts` 配置
- 扩展/新建组件 Recipe
- 配置字体加载
- 定义动画 keyframes

## 2. 文件结构

```
src/styles/
├── theme.ts                    # 主题入口（重构）
├── tokens/
│   ├── colors.ts              # 颜色令牌（新建）
│   ├── fonts.ts               # 字体配置（新建）
│   ├── animations.ts          # 动画 keyframes（新建）
│   └── glassmorphism.ts       # 毛玻璃预设（新建）
├── components/
│   ├── button.ts              # Button recipe（扩展）
│   ├── input.ts               # Input recipe（扩展）
│   ├── select.ts              # Select slot recipe（扩展）
│   ├── drawer.ts              # Drawer slot recipe（扩展）
│   ├── card.ts                # Card recipe（新建）
│   ├── badge.ts               # Badge recipe（新建）
│   ├── bottom-nav.ts          # BottomNav recipe（新建）
│   └── popover.ts             # Popover slot recipe（新建）
└── index.ts                   # 导出入口
```

## 3. 设计令牌 (Design Tokens)

### 3.1 颜色令牌 (`tokens/colors.ts`)

```typescript
export const colors = {
  brand: {
    matrix: { value: '#00FF41' },
    alert: { value: '#FF6B35' },
    cyber: { value: '#00D4FF' },
  },
  bg: {
    deep: { value: '#0A0A0A' },
    carbon: { value: '#1A1A1A' },
    dark: { value: '#2A2A2A' },
  },
  text: {
    neon: { value: '#E0E0E0' },
    mist: { value: '#888888' },
    dim: { value: '#555555' },
  },
  semantic: {
    success: { value: '#00FF41' },
    warning: { value: '#FFD700' },
    error: { value: '#FF3366' },
    info: { value: '#00D4FF' },
  },
} as const;

// 透明度变体 (用于 semanticTokens)
export const alphaColors = {
  'matrix/10': { value: 'rgba(0, 255, 65, 0.1)' },
  'matrix/20': { value: 'rgba(0, 255, 65, 0.2)' },
  'matrix/30': { value: 'rgba(0, 255, 65, 0.3)' },
  'matrix/50': { value: 'rgba(0, 255, 65, 0.5)' },
  'error/10': { value: 'rgba(255, 51, 102, 0.1)' },
  'error/20': { value: 'rgba(255, 51, 102, 0.2)' },
  'warning/20': { value: 'rgba(255, 215, 0, 0.2)' },
  'info/20': { value: 'rgba(0, 212, 255, 0.2)' },
} as const;
```

### 3.2 字体配置 (`tokens/fonts.ts`)

```typescript
export const fonts = {
  heading: { value: "'Orbitron', 'SF Pro Display', -apple-system, sans-serif" },
  body: { value: "'Rajdhani', 'SF Pro Display', -apple-system, sans-serif" },
  mono: { value: "'JetBrains Mono', 'Fira Code', monospace" },
} as const;
```

**字体加载** (`app/layout.tsx`):

```typescript
import { Orbitron, Rajdhani } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});
```

### 3.3 动画 Keyframes (`tokens/animations.ts`)

```typescript
export const keyframes = {
  'pulse-glow': {
    '0%, 100%': {
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
    },
    '50%': {
      boxShadow: '0 0 20px rgba(0, 255, 65, 0.6), 0 0 30px rgba(0, 255, 65, 0.3)',
    },
  },
  glitch: {
    '0%': { transform: 'translate(0)' },
    '20%': { transform: 'translate(-2px, 2px)' },
    '40%': { transform: 'translate(-2px, -2px)' },
    '60%': { transform: 'translate(2px, 2px)' },
    '80%': { transform: 'translate(2px, -2px)' },
    '100%': { transform: 'translate(0)' },
  },
  'scan-line': {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: '0 100px' },
  },
  'matrix-flow': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '0% 100%' },
  },
} as const;
```

### 3.4 毛玻璃预设 (`tokens/glassmorphism.ts`)

```typescript
export const glass = {
  bg: { value: 'rgba(26, 26, 26, 0.8)' },
  bgHeavy: { value: 'rgba(26, 26, 26, 0.95)' },
  border: { value: 'rgba(0, 255, 65, 0.2)' },
  borderHover: { value: 'rgba(0, 255, 65, 0.4)' },
} as const;

export const glassStyles = {
  base: {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'glass.bg',
    borderColor: 'glass.border',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  // Fallback for browsers without backdrop-filter support
  fallback: {
    background: 'glass.bgHeavy',
    borderColor: 'glass.border',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
} as const;
```

### 3.5 发光预设

```typescript
export const glow = {
  sm: { value: '0 0 5px rgba(0, 255, 65, 0.3)' },
  md: { value: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)' },
  lg: { value: '0 0 15px rgba(0, 255, 65, 0.4), 0 0 30px rgba(0, 255, 65, 0.2)' },
  error: { value: '0 0 10px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.1)' },
} as const;
```

## 4. 组件 Recipe 定义

### 4.1 Button Recipe (`components/button.ts`)

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const button = defineRecipe({
  className: 'neo-button',
  base: {
    fontFamily: 'body',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'linear-gradient(135deg, #00FF41, #00CC33)',
        color: 'bg.deep',
        _hover: {
          boxShadow: 'glow.lg',
          animation: 'pulse-glow 2s ease-in-out infinite',
        },
        _active: {
          animation: 'glitch 150ms ease-in-out',
        },
      },
      secondary: {
        background: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'brand.matrix',
        color: 'brand.matrix',
        boxShadow: 'glow.sm',
        _hover: {
          background: 'matrix/10',
          boxShadow: 'glow.md',
        },
      },
      danger: {
        background: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'semantic.error',
        color: 'semantic.error',
        boxShadow: '0 0 5px rgba(255, 51, 102, 0.3)',
        _hover: {
          background: 'error/10',
          boxShadow: 'glow.error',
        },
      },
      ghost: {
        background: 'transparent',
        color: 'text.neon',
        _hover: {
          background: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    size: {
      sm: { height: '32px', px: '16px', fontSize: '12px' },
      md: { height: '40px', px: '20px', fontSize: '14px' },
      lg: { height: '48px', px: '24px', fontSize: '16px' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
```

### 4.2 Input Recipe (`components/input.ts`)

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const input = defineRecipe({
  className: 'neo-input',
  base: {
    fontFamily: 'body',
    fontSize: '14px',
    borderRadius: '4px',
    color: 'text.neon',
    transition: 'all 200ms ease-out',
    _placeholder: {
      color: 'text.dim',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      outline: {
        background: 'bg.deep',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'bg.dark',
        _focus: {
          borderColor: 'brand.matrix',
          boxShadow: 'glow.md',
          outline: 'none',
        },
        _invalid: {
          borderColor: 'semantic.error',
          boxShadow: 'glow.error',
        },
      },
      solid: {
        background: 'bg.carbon',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'bg.dark',
        _focus: {
          borderColor: 'brand.matrix',
          boxShadow: 'glow.md',
          outline: 'none',
        },
      },
      subtle: {
        background: 'transparent',
        borderWidth: '0',
        _focus: {
          boxShadow: 'glow.sm',
          outline: 'none',
        },
      },
    },
    size: {
      sm: { height: '32px', px: '12px', fontSize: '12px' },
      md: { height: '40px', px: '16px', fontSize: '14px' },
      lg: { height: '48px', px: '16px', fontSize: '16px' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});
```

### 4.3 Card Recipe (`components/card.ts`)

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const card = defineRecipe({
  className: 'neo-card',
  base: {
    background: 'glass.bg',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'glass.border',
    borderRadius: '8px',
    boxShadow: 'glow.sm',
    transition: 'all 150ms ease-out',
    _hover: {
      boxShadow: 'glow.md',
      borderColor: 'glass.borderHover',
    },
  },
  variants: {
    variant: {
      default: {},
      decorated: {
        position: 'relative',
        _before: {
          content: '""',
          position: 'absolute',
          top: '-1px',
          left: '-1px',
          width: '12px',
          height: '12px',
          borderTop: '2px solid rgba(0, 255, 65, 0.5)',
          borderLeft: '2px solid rgba(0, 255, 65, 0.5)',
        },
        _after: {
          content: '""',
          position: 'absolute',
          bottom: '-1px',
          right: '-1px',
          width: '12px',
          height: '12px',
          borderBottom: '2px solid rgba(0, 255, 65, 0.5)',
          borderRight: '2px solid rgba(0, 255, 65, 0.5)',
        },
      },
      scanline: {
        position: 'relative',
        overflow: 'hidden',
        _after: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.03) 2px,
            rgba(0, 255, 65, 0.03) 4px
          )`,
          pointerEvents: 'none',
          animation: 'scan-line 4s linear infinite',
        },
      },
    },
    size: {
      sm: { p: '16px' },
      md: { p: '24px' },
      lg: { p: '32px' },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});
```

### 4.4 Badge Recipe (`components/badge.ts`)

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const badge = defineRecipe({
  className: 'neo-badge',
  base: {
    display: 'inline-block',
    fontFamily: 'body',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    px: '8px',
    py: '2px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  variants: {
    colorScheme: {
      success: {
        background: 'matrix/20',
        borderColor: 'brand.matrix',
        color: 'brand.matrix',
      },
      warning: {
        background: 'warning/20',
        borderColor: 'semantic.warning',
        color: 'semantic.warning',
      },
      error: {
        background: 'error/20',
        borderColor: 'semantic.error',
        color: 'semantic.error',
      },
      info: {
        background: 'info/20',
        borderColor: 'semantic.info',
        color: 'semantic.info',
      },
    },
  },
  defaultVariants: {
    colorScheme: 'success',
  },
});
```

### 4.5 Drawer Slot Recipe (`components/drawer.ts`)

```typescript
import { defineSlotRecipe } from '@chakra-ui/react';

export const drawer = defineSlotRecipe({
  className: 'neo-drawer',
  slots: ['backdrop', 'positioner', 'content', 'header', 'body', 'footer', 'closeTrigger'],
  base: {
    backdrop: {
      background: 'rgba(0, 0, 0, 0.6)',
    },
    content: {
      background: 'glass.bg',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderLeft: '1px solid',
      borderColor: 'glass.border',
      boxShadow: '-5px 0 15px rgba(0, 255, 65, 0.1)',
    },
    header: {
      fontFamily: 'heading',
      color: 'brand.matrix',
      borderBottom: '1px solid',
      borderColor: 'glass.border',
    },
    body: {
      color: 'text.neon',
    },
    footer: {
      borderTop: '1px solid',
      borderColor: 'glass.border',
    },
    closeTrigger: {
      color: 'text.mist',
      _hover: {
        color: 'brand.matrix',
      },
    },
  },
  variants: {
    size: {
      sm: { content: { maxWidth: '280px' } },
      md: { content: { maxWidth: '320px' } },
      lg: { content: { maxWidth: '480px' } },
      full: { content: { maxWidth: '100%' } },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
```

### 4.6 Select Slot Recipe (`components/select.ts`)

```typescript
import { defineSlotRecipe } from '@chakra-ui/react';

export const select = defineSlotRecipe({
  className: 'neo-select',
  slots: ['root', 'trigger', 'content', 'item', 'itemText', 'itemIndicator'],
  base: {
    trigger: {
      fontFamily: 'body',
      background: 'bg.deep',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      borderRadius: '4px',
      color: 'text.neon',
      _focus: {
        borderColor: 'brand.matrix',
        boxShadow: 'glow.md',
      },
    },
    content: {
      background: 'glass.bg',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'glass.border',
      borderRadius: '4px',
      boxShadow: 'glow.md',
    },
    item: {
      color: 'text.neon',
      transition: 'background 150ms',
      _hover: {
        background: 'matrix/10',
      },
      _selected: {
        background: 'matrix/20',
        borderLeft: '2px solid',
        borderColor: 'brand.matrix',
      },
    },
  },
});
```

### 4.7 BottomNav Recipe (`components/bottom-nav.ts`)

```typescript
import { defineSlotRecipe } from '@chakra-ui/react';

export const bottomNav = defineSlotRecipe({
  className: 'neo-bottom-nav',
  slots: ['root', 'item', 'icon', 'label'],
  base: {
    root: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'glass.bg',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid',
      borderColor: 'glass.border',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 200,
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: 'text.mist',
      cursor: 'pointer',
      transition: 'color 150ms',
      _active: {
        color: 'brand.matrix',
      },
    },
    icon: {
      fontSize: '24px',
      _groupActive: {
        filter: 'drop-shadow(0 0 4px #00FF41)',
      },
    },
    label: {
      fontSize: '10px',
      fontFamily: 'body',
    },
  },
});
```

### 4.8 Popover Slot Recipe (`components/popover.ts`)

```typescript
import { defineSlotRecipe } from '@chakra-ui/react';

export const popover = defineSlotRecipe({
  className: 'neo-popover',
  slots: ['content', 'header', 'body', 'footer', 'arrow'],
  base: {
    content: {
      background: 'glass.bg',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'glass.border',
      borderRadius: '4px',
      boxShadow: 'glow.sm',
    },
    header: {
      fontFamily: 'heading',
      fontSize: '14px',
      color: 'brand.matrix',
      borderBottom: '1px solid',
      borderColor: 'glass.border',
    },
    body: {
      color: 'text.neon',
    },
    arrow: {
      '--popper-arrow-bg': 'rgba(26, 26, 26, 0.8)',
    },
  },
});
```

## 5. Theme 入口 (`theme.ts`)

```typescript
import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { colors, alphaColors } from './tokens/colors';
import { fonts } from './tokens/fonts';
import { keyframes } from './tokens/animations';
import { glass, glow } from './tokens/glassmorphism';
import { button } from './components/button';
import { input } from './components/input';
import { card } from './components/card';
import { badge } from './components/badge';
import { select } from './components/select';
import { drawer } from './components/drawer';
import { bottomNav } from './components/bottom-nav';
import { popover } from './components/popover';

export const config = defineConfig({
  theme: {
    tokens: {
      colors: { ...colors, ...alphaColors },
      fonts,
      shadows: glow,
    },
    semanticTokens: {
      colors: {
        glass,
        primary: { value: '{colors.brand.matrix}' },
        secondary: { value: '{colors.brand.alert}' },
        accent: { value: '{colors.brand.cyber}' },
      },
    },
    keyframes,
    recipes: {
      button,
      input,
      card,
      badge,
    },
    slotRecipes: {
      select,
      drawer,
      bottomNav,
      popover,
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

## 6. 任务拆分

### 05a - 前置准备

| 任务 | 文件路径 | 说明 |
|------|----------|------|
| T-05a-01 | `src/styles/tokens/colors.ts` | 颜色令牌定义 |
| T-05a-02 | `src/styles/tokens/fonts.ts` | 字体配置 |
| T-05a-03 | `src/styles/tokens/animations.ts` | 动画 keyframes |
| T-05a-04 | `src/styles/tokens/glassmorphism.ts` | 毛玻璃预设 |
| T-05a-05 | `src/app/layout.tsx` | 字体加载配置 |

### 05b - 后端

无后端任务（纯前端样式重构）

### 05c - 前端

| 任务 | 文件路径 | 说明 |
|------|----------|------|
| T-05c-01 | `src/styles/components/button.ts` | Button recipe 重构 |
| T-05c-02 | `src/styles/components/input.ts` | Input recipe 重构 |
| T-05c-03 | `src/styles/components/select.ts` | Select slot recipe 扩展 |
| T-05c-04 | `src/styles/components/drawer.ts` | Drawer slot recipe 扩展 |
| T-05c-05 | `src/styles/components/card.ts` | Card recipe 新建 |
| T-05c-06 | `src/styles/components/badge.ts` | Badge recipe 新建 |
| T-05c-07 | `src/styles/components/bottom-nav.ts` | BottomNav recipe 新建 |
| T-05c-08 | `src/styles/components/popover.ts` | Popover slot recipe 新建 |
| T-05c-09 | `src/styles/theme.ts` | 主题入口重构 |
| T-05c-10 | 验证 | TypeScript 类型检查 + Lint |

## 7. 测试策略

### 视觉测试

- 使用 Storybook 或独立测试页面验证各组件样式
- 对照 `03_ui_design/preview/index.html` 进行视觉走查

### 性能测试

- 使用 Chrome DevTools 测量动画 FPS
- 使用 Lighthouse 测量字体加载对 LCP 的影响

### 兼容性测试

- Chrome 76+
- Safari 9+ (macOS/iOS)
- Firefox 103+
- 验证 backdrop-filter 降级方案

### 无障碍测试

- 使用 axe-core 检查对比度
- 验证 prefers-reduced-motion 支持

## 8. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 字体加载慢 | LCP 增加 | 使用 `display: swap`，预加载关键字体 |
| backdrop-filter 不支持 | 毛玻璃失效 | 提供纯色背景降级 |
| 动画性能差 | 卡顿 | 仅使用 transform/opacity，避免重排 |
| Recipe 类型错误 | 编译失败 | 严格遵循 Chakra UI v3 类型定义 |
