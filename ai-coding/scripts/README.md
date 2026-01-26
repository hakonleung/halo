# Scripts

该目录包含 AI Coding 工作流的本地校验脚本。

## 用法

推荐使用 `bash` 直接运行：

```bash
bash ai-coding/scripts/flow-sync-check.sh
bash ai-coding/scripts/flow-stage-validate.sh --stage all
```

也可直接执行（需可执行权限）：

```bash
./ai-coding/scripts/flow-sync-check.sh --work-dir ai-works/PRD_XXX --min-rate 0.95
./ai-coding/scripts/flow-stage-validate.sh --stage 05b
```

