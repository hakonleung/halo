# 数据结构定义

> 工作流核心数据结构的统一定义。

## overview.json

```typescript
interface WorkflowOverview {
  id: string;                        // PRD_XXX
  branch: string;                    // feat/PRD_XXX
  title: string;
  description: string;
  created_at: string;                // ISO 8601
  updated_at: string;
  current_stage: StageId;
  status: 'in_progress' | 'completed' | 'paused';
  stages: Record<StageId, StageStatus>;
}

type StageId = '01_requirements' | '02_prd' | '03_ui_design' | '04_tech_design'
  | '05a_prep' | '05b_backend' | '05c_frontend' | '06_validation' | '07_deploy';
```

## StageStatus

```typescript
interface StageStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'rework' | 'auto_passed';
  risk_level: 'high' | 'medium' | 'low';
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  ai_audit: 'passed' | 'failed' | null;
  human_audit: 'passed' | 'failed' | 'skipped' | null;
  rework_count: number;
  commit_hash: string | null;
}
```

## history.json

```typescript
interface StageHistory {
  stage: StageId;
  records: HistoryRecord[];
}

interface HistoryRecord {
  id: string;
  type: 'ai_result' | 'ai_audit' | 'human_audit' | 'rework' | 'test' | 'error' | 'commit';
  timestamp: string;
  summary: string;
  details: {
    // ai_result: action, files_affected, content_summary
    // ai_audit: checklist, pass_rate, result, failure_reasons?
    // human_audit: result, comments?
    // rework: reason, triggered_by, affected_files, scope
    // test: test_type, passed, failed, total
    // error: error_type, message, resolution?
    // commit: hash, message, files_changed
    [key: string]: any;
  };
}
```
