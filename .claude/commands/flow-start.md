# ARC 完整工作流

执行 ARC 完整工作流（7阶段），用于新功能开发。

## 用户需求

$ARGUMENTS

## 执行流程

请严格按照 `ai-coding/action-work.md` 定义的流程执行：

### 1. 初始化

1. 生成单号 `PRD_XXX`（读取 `ai-coding/works/` 目录确定下一个编号）
2. 创建 Git 分支 `feat/PRD_XXX`
3. 创建工作目录 `ai-coding/works/PRD_XXX/`
4. 初始化 `overview.json`

### 2. 执行 7 阶段

按顺序执行以下阶段，每阶段参照对应文档：

| 阶段 | 文档 | 风险 |
|------|------|------|
| 01-需求澄清 | `ai-coding/workflow/01-requirements.md` | 高（必须人类确认） |
| 02-PRD | `ai-coding/workflow/02-prd.md` | 中 |
| 03-UI设计 | `ai-coding/workflow/03-ui-design.md` | 中 |
| 04-技术设计 | `ai-coding/workflow/04-tech-design.md` | 高（必须人类确认） |
| 05a-前置 | `ai-coding/workflow/05a-implementation-prep.md` | 低 |
| 05b-后端 | `ai-coding/workflow/05b-implementation-backend.md` | 中 |
| 05c-前端 | `ai-coding/workflow/05c-implementation-frontend.md` | 中 |
| 06-验证 | `ai-coding/workflow/06-validation.md` | 高（必须人类确认） |
| 07-部署 | `ai-coding/workflow/07-deploy.md` | 高（必须人类确认） |

### 3. 上下文加载

- 读取 `ai-coding/context/project.md` 了解项目背景
- 读取 `ai-coding/context/tech-config.md` 了解技术规范
- 读取 `ai-coding/context/ui-config.md` 了解 UI 规范

### 4. 质量门禁

每阶段完成后：
1. 运行 AI 自验收
2. 高风险阶段等待人类确认
3. 自动提交 Git commit

## 用户响应格式

- `确认` / `通过` - 进入下一步
- `修改 [内容]` - 修改指定内容
- `返工: [原因]` - 当前阶段返工
- `回退到 [阶段]` - 回退到指定阶段

请开始执行工作流。
