# FEAT_009: 用户画像与情绪追踪

## 需求分析

### 需求列表

1. 拆分 message route，独立维护 system prompt
2. AI 定位为用户的"数字分身"
3. 新增数据表保存用户画像、近期情绪和行为
4. 新增 profile agent：每次对话后自动分析并更新用户画像和情绪/行为
5. 新用户无画像时，AI 主动了解用户

### 修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/db/schema.ts` | 修改 | 新增 `neologUserProfiles` 表 |
| `src/types/database.ts` | 修改 | 新增 `neolog_user_profiles` 类型定义 |
| `src/types/profile-server.ts` | 新增 | 用户画像相关类型定义 |
| `src/lib/profile-service.ts` | 新增 | 用户画像 CRUD 服务 |
| `src/lib/agents/system-prompt.ts` | 新增 | 独立的系统提示词模块 |
| `src/lib/agents/profile-agent.ts` | 新增 | 画像分析 agent |
| `src/app/api/chat/message/route.ts` | 修改 | 集成新的 system prompt 和 profile agent |
| `supabase/migrations/0001_*.sql` | 新增 | 数据库迁移文件 |
