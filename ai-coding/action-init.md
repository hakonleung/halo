# 初始化项目指令

> 创建或初始化 AI Coding 工作流配置。

## 触发指令

```
/flow-init
```

## 执行流程

```mermaid
flowchart TD
    A["/flow-init"] --> B{"是否从现有项目初始化?"}
    B -->|是| C["扫描项目"]
    B -->|否| D["阶段 1: project.md"]
    C --> D
    
    subgraph STAGE1["阶段 1: project.md"]
        D --> D1["询问/确认"]
        D1 --> D2["生成 project.md"]
    end
    
    D2 --> E["阶段 2: ui-config.md"]
    
    subgraph STAGE2["阶段 2: ui-config.md"]
        E --> E1["询问/确认"]
        E1 --> E2["生成 ui-config.md"]
    end
    
    E2 --> F["阶段 3: tech-config.md"]
    
    subgraph STAGE3["阶段 3: tech-config.md"]
        F --> F1["询问/确认"]
        F1 --> F2["生成 tech-config.md"]
    end
    
    F2 --> G["完成"]
```

## 初始选择

**询问用户**: 是否从现有项目初始化配置？
- **是**: 扫描项目代码，用扫描结果填充问题，然后询问确认/修改
- **否**: 直接按问题列表询问用户

## 阶段说明

### 阶段 0: 扫描项目（仅当选择"从现有项目初始化"时）

扫描内容用于填充询问清单：
- **项目结构**: `package.json`, `src/` 目录
- **技术栈**: 框架、数据库、ORM、UI库、状态管理、i18n、ESLint、Prettier
- **UI配置**: 主题文件、颜色、字体
- **开发工具**: VSCode 配置

**扫描提示**:
- 项目名称: `package.json.name`
- 页面结构: `src/app/` 或路由文件
- 技术栈: `package.json` 依赖 + 配置文件
- UI配置: `theme.ts`, `tailwind.config.js`
- 开发工具: `.eslintrc.*`, `.prettierrc.*`, `.vscode/settings.json`

### 阶段 1: 生成 project.md

- **询问清单**: [shared/config-questions/project-questions.md](./shared/config-questions/project-questions.md)
- **默认配置**: [shared/config-defaults/project-defaults.md](./shared/config-defaults/project-defaults.md)
- **流程**: 
  - 从现有项目：用扫描结果填充 → 询问确认/修改 → 结合默认值生成
  - 新建项目：按问题列表询问 → 结合默认值生成

### 阶段 2: 生成 ui-config.md

- **询问清单**: [shared/config-questions/ui-config-questions.md](./shared/config-questions/ui-config-questions.md)
- **默认配置**: [shared/config-defaults/ui-config-defaults.md](./shared/config-defaults/ui-config-defaults.md)
- **流程**: 
  - 从现有项目：用扫描结果填充 → 询问确认/修改 → 结合默认值生成
  - 新建项目：按问题列表询问（提供可选项）→ 结合默认值生成

### 阶段 3: 生成 tech-config.md

- **询问清单**: [shared/config-questions/tech-config-questions.md](./shared/config-questions/tech-config-questions.md)
- **默认配置**: [shared/config-defaults/tech-config-defaults.md](./shared/config-defaults/tech-config-defaults.md)
- **流程**: 
  - 从现有项目：用扫描结果填充 → 询问确认/修改 → 结合默认值生成
  - 新建项目：按问题列表询问（提供可选项）→ 结合默认值生成
- **额外**: 如启用 VSCode 自动格式化，生成 `.vscode/settings.json`

## 完成提示

```
初始化完成！

已生成配置文件：
- ai-coding/context/project.md
- ai-coding/context/ui-config.md
- ai-coding/context/tech-config.md

可以使用 /flow-start [需求] 开始工作流。
```

## 字段映射说明

问题回答会映射到 context 文件的对应字段，映射关系在每个问题的注释中说明（用 `→` 表示）。

## 用户响应格式

详见 [shared/response-format.md](./shared/response-format.md)
