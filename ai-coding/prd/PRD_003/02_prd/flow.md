# PRD_003 功能流程图

## 样式系统架构

```mermaid
flowchart TB
    subgraph Theme["Theme 配置"]
        TOKENS["Design Tokens"]
        FONTS["字体配置"]
        COLORS["颜色系统"]
        ANIM["动画定义"]
    end

    subgraph Recipes["组件 Recipes"]
        BTN["Button"]
        INPUT["Input"]
        SELECT["Select"]
        DRAWER["Drawer"]
        CARD["Card"]
        BADGE["Badge"]
        NAV["BottomNav"]
    end

    subgraph Effects["视觉效果"]
        GLASS["毛玻璃"]
        GLOW["发光"]
        PULSE["脉冲"]
        GLITCH["故障"]
        SCAN["扫描线"]
    end

    TOKENS --> COLORS
    TOKENS --> FONTS
    TOKENS --> ANIM

    COLORS --> GLASS
    COLORS --> GLOW
    ANIM --> PULSE
    ANIM --> GLITCH
    ANIM --> SCAN

    GLASS --> DRAWER
    GLASS --> SELECT
    GLASS --> CARD
    GLASS --> NAV

    GLOW --> BTN
    GLOW --> INPUT
    GLOW --> BADGE

    PULSE --> BTN
    SCAN --> CARD
```

## 组件状态流转

### Button 状态

```mermaid
stateDiagram-v2
    [*] --> Default
    Default --> Hover: mouseenter
    Hover --> Default: mouseleave
    Hover --> Active: click
    Active --> Hover: release
    Default --> Disabled: disabled=true
    Disabled --> Default: disabled=false

    state Hover {
        [*] --> GlowPulse
        GlowPulse --> GlowPulse: animation loop
    }

    state Active {
        [*] --> GlitchEffect
        GlitchEffect --> [*]: 150ms
    }
```

### Input 状态

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Focused: focus
    Focused --> Idle: blur
    Focused --> Error: validation fail
    Error --> Focused: input change
    Idle --> Disabled: disabled=true

    state Focused {
        [*] --> GlowBorder
        GlowBorder: border-color: matrix-green
        GlowBorder: box-shadow: glow
    }

    state Error {
        [*] --> ErrorGlow
        ErrorGlow: border-color: neon-red
        ErrorGlow: box-shadow: error-glow
    }
```

### Drawer 状态

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Opening: open()
    Opening --> Open: animation complete
    Open --> Closing: close()
    Closing --> Closed: animation complete

    state Open {
        [*] --> GlassmorpismActive
        GlassmorpismActive: backdrop-filter: blur(16px)
        GlassmorpismActive: background: rgba(26,26,26,0.8)
    }
```

## 动画时序

```mermaid
sequenceDiagram
    participant U as User
    participant B as Button
    participant A as Animation

    U->>B: mouseenter
    B->>A: start pulse-glow
    loop Every 2s
        A->>B: glow intensity 0.3 → 0.6 → 0.3
    end
    U->>B: click
    B->>A: stop pulse-glow
    B->>A: trigger glitch (150ms)
    A->>B: glitch complete
    U->>B: mouseleave
    B->>A: reset to default
```

## 降级策略

```mermaid
flowchart TD
    CHECK["检查 backdrop-filter 支持"]
    CHECK -->|支持| GLASS["应用毛玻璃效果"]
    CHECK -->|不支持| FALLBACK["应用半透明背景"]

    GLASS --> RENDER["渲染组件"]
    FALLBACK --> RENDER

    subgraph Glassmorphism
        G1["backdrop-filter: blur(16px)"]
        G2["background: rgba(26,26,26,0.8)"]
    end

    subgraph Fallback
        F1["background: rgba(26,26,26,0.95)"]
    end

    GLASS --> Glassmorphism
    FALLBACK --> Fallback
```

## 响应式适配

```mermaid
flowchart LR
    subgraph Mobile["Mobile < 640px"]
        M1["BottomNav: 毛玻璃"]
        M2["Drawer: 全屏"]
        M3["Card: 单列"]
    end

    subgraph Tablet["640-1024px"]
        T1["TopNav: 固定"]
        T2["Drawer: 侧边"]
        T3["Card: 双列"]
    end

    subgraph Desktop["> 1024px"]
        D1["TopNav: 固定"]
        D2["Drawer: 侧边"]
        D3["Card: 多列"]
    end

    Mobile --> Tablet
    Tablet --> Desktop
```
