# 功能流程图：目标管理

## 1. 目标创建流程

```mermaid
flowchart TD
    A[用户进入 /goals 页面] --> B[点击创建目标按钮]
    B --> C[显示目标创建表单]
    C --> D[用户填写基本信息]
    D --> E[用户设置达成条件]
    E --> F{数据验证}
    F -->|失败| G[显示错误提示]
    G --> D
    F -->|通过| H[调用 POST /api/goals]
    H --> I{创建成功?}
    I -->|失败| J[显示错误提示]
    J --> D
    I -->|成功| K[显示成功提示]
    K --> L[刷新目标列表]
    L --> M[关闭表单]
```

## 2. 目标查看流程

```mermaid
flowchart TD
    A[用户进入 /goals 页面] --> B[调用 GET /api/goals]
    B --> C{加载成功?}
    C -->|失败| D[显示错误提示]
    C -->|成功| E[显示目标列表]
    E --> F[用户点击目标卡片]
    F --> G[导航到 /goals/[id]]
    G --> H[调用 GET /api/goals/[id]]
    H --> I{加载成功?}
    I -->|失败| J[显示错误提示]
    I -->|成功| K[显示目标详情]
    K --> L[计算并显示进度]
```

## 3. 目标编辑流程

```mermaid
flowchart TD
    A[用户在目标详情页面] --> B[点击编辑按钮]
    B --> C[显示编辑表单]
    C --> D[预填充现有数据]
    D --> E[用户修改信息]
    E --> F{数据验证}
    F -->|失败| G[显示错误提示]
    G --> E
    F -->|通过| H[调用 PATCH /api/goals/[id]]
    H --> I{更新成功?}
    I -->|失败| J[显示错误提示]
    J --> E
    I -->|成功| K[显示成功提示]
    K --> L[刷新目标详情]
    L --> M[重新计算进度]
```

## 4. 目标删除流程

```mermaid
flowchart TD
    A[用户在目标详情页面] --> B[点击删除按钮]
    B --> C[显示确认对话框]
    C --> D{用户确认?}
    D -->|取消| E[关闭对话框]
    D -->|确认| F[调用 DELETE /api/goals/[id]]
    F --> G{删除成功?}
    G -->|失败| H[显示错误提示]
    G -->|成功| I[显示成功提示]
    I --> J[导航到 /goals]
    J --> K[刷新目标列表]
```

## 5. 目标进度计算流程

```mermaid
flowchart TD
    A[触发进度计算] --> B[获取目标达成条件]
    B --> C[根据 behaviorId 查询行为记录]
    C --> D[根据 period 筛选时间范围]
    D --> E{计算指标}
    E -->|count| F[统计记录数量]
    E -->|sum| G[求和]
    E -->|avg| H[求平均值]
    F --> I[根据 operator 和 value 判断]
    G --> I
    H --> I
    I --> J{是否达成?}
    J -->|是| K[更新状态为 completed]
    J -->|否| L[计算进度百分比]
    K --> M[更新目标]
    L --> M
    M --> N[返回进度信息]
```

## 6. 目标状态流转

```mermaid
stateDiagram-v2
    [*] --> active: 创建目标
    active --> completed: 目标达成/手动标记
    active --> abandoned: 手动放弃
    completed --> active: 手动恢复
    abandoned --> active: 手动恢复
    completed --> [*]: 删除
    abandoned --> [*]: 删除
```

## 7. 数据流图

```mermaid
flowchart LR
    A[前端页面] --> B[React Hooks]
    B --> C[API 路由]
    C --> D[Goal Service]
    D --> E[Supabase Client]
    E --> F[PostgreSQL]
    
    G[行为记录] --> H[进度计算服务]
    H --> D
    D --> I[返回数据]
    I --> B
    B --> A
```

