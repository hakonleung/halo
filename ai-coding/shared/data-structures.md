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
  metrics: WorkflowMetrics;          // 流程指标
  snapshots: SnapshotRef[];          // 快照引用列表
  last_snapshot_id: string | null;   // 最新快照ID
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

## 快照结构

```typescript
// 快照引用 (存储在 overview.json)
interface SnapshotRef {
  id: string;                        // snap_001
  stage: StageId;
  type: 'stage_complete' | 'manual' | 'auto_pause' | 'before_rework';
  created_at: string;
  file_path: string;                 // snapshots/snap_001_xxx.json
}

// 快照完整内容 (独立文件)
interface Snapshot {
  id: string;
  workflow_id: string;               // PRD_XXX
  stage: StageId;
  type: 'stage_complete' | 'manual' | 'auto_pause' | 'before_rework';
  created_at: string;

  // 状态快照
  overview_state: WorkflowOverview;

  // Context 缓存快照
  context_cache: {
    project: boolean;
    ui: boolean;
    tech: boolean;
  };

  // 阶段进度快照
  stage_progress: {
    current_step: string;
    completed_steps: string[];
    pending_steps: string[];
  };

  // Git 状态
  git_state: {
    branch: string;
    commit_hash: string;
    uncommitted_files: string[];
  };

  // 恢复提示
  resume_hint: string;
}
```

## WorkflowMetrics

```typescript
interface WorkflowMetrics {
  // 效率指标
  total_duration_minutes: number;
  human_interventions: number;
  human_wait_minutes: number;
  auto_passed_stages: number;
  total_rework_count: number;
  tokens_used: number;

  // 质量指标
  ai_audit_accuracy: number;         // 0-1
  ac_total: number;
  ac_passed: number;
  lint_errors: number;
  ts_errors: number;
  test_coverage: number;             // 0-1

  // 产出统计
  files_created: number;
  files_modified: number;
  lines_added: number;
  lines_removed: number;

  // 部署后 (人工填写)
  post_deploy_bugs: number | null;
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
