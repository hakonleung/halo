# 数据库迁移指南

## 问题
错误信息：`"Could not find the table 'public.neolog_goals' in the schema cache"`

这表示数据库迁移还没有在 Supabase 上运行。

## 解决方案

### 方法 1: 使用迁移脚本（推荐）

运行项目提供的迁移脚本：

```bash
pnpm db:migrate
```

这个脚本会：
- 自动检测是否安装了 Supabase CLI
- 如果已安装且项目已链接，自动执行迁移
- 如果没有 CLI，会显示手动执行指南

### 方法 2: 通过 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制并执行以下文件的内容（按顺序）：
   - `supabase/migrations/0000_public_marvel_boy.sql` - 创建所有表
   - `supabase/custom.sql` - 创建函数和触发器

或者直接执行合并后的完整 schema：
   - `supabase/schema.sql` - 包含所有迁移和自定义 SQL

### 方法 3: 使用 Supabase CLI

如果你安装了 Supabase CLI：

```bash
# 链接到你的 Supabase 项目
supabase link --project-ref your-project-ref

# 推送迁移
supabase db push
```

或者使用项目脚本：
```bash
pnpm db:migrate
```

### 方法 4: 手动执行 SQL

如果上述方法不可用，可以：

1. 打开 Supabase Dashboard → SQL Editor
2. 复制 `supabase/migrations/0000_public_marvel_boy.sql` 的全部内容
3. 粘贴并执行
4. 然后复制并执行 `supabase/custom.sql` 的内容

## 验证

执行迁移后，在 Supabase Dashboard 的 **Table Editor** 中应该能看到以下表：

- `neolog_behavior_definitions`
- `neolog_behavior_records`
- `neolog_conversations`
- `neolog_goals` ✅
- `neolog_messages`
- `neolog_notes`
- `neolog_user_settings`

## 注意事项

- 确保环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已正确设置
- 迁移只需要执行一次
- 如果表已存在，某些 SQL 语句可能会报错，这是正常的（可以使用 `IF NOT EXISTS` 来避免）

## 快速开始

最简单的执行方式：

```bash
# 运行迁移脚本
pnpm db:migrate

# 如果脚本提示需要手动执行，则：
# 1. 打开 Supabase Dashboard
# 2. 进入 SQL Editor
# 3. 复制 supabase/schema.sql 的内容
# 4. 粘贴并执行
```

