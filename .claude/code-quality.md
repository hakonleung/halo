# 原则

1. 类型安全，严格的 ts 规则
2. 人类可读性，关注点分离
3. 模块化，解偶
4. 收敛
5. 复用
6. 分层
7. 适度抽象
8. 前后端隔离
9. 缓存

# type，lint 和 format

1. 添加 format script，保存自动 format
2. 添加 ts-check script，每次代码生成结束前运行，确保类型通过
3. 添加 lint-fix script，每次代码生成结束前运行，确保通过
4. ts 使用严格的规则
5. lint 使用严格的规则
6. 禁用 `as`, `!`, `any`, `export *`
7. 对于难以处理的复杂类型，可以通过 `eslint-disable-next-line` 或 `@ts-expect` 来绕过
8. 文件行数小于 300 行，对大文件进行拆分
