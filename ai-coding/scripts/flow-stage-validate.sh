#!/usr/bin/env bash
set -euo pipefail

STAGE="all"
SKIP_TESTS="false"

usage() {
  cat <<'EOF'
Usage:
  flow-stage-validate.sh [--stage <id>] [--skip-tests]

Stages:
  all, 05a, 05b, 05c, 06, 07

Examples:
  bash ai-coding/scripts/flow-stage-validate.sh --stage all
  bash ai-coding/scripts/flow-stage-validate.sh --stage 05b
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--stage)
      STAGE="${2:-}"
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS="true"
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$STAGE" ]]; then
  echo "Stage is required."
  usage
  exit 1
fi

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "Missing file: $path"
    exit 1
  fi
}

require_find() {
  local path="$1"
  local name="$2"
  local label="$3"
  if [[ ! -d "$path" ]]; then
    echo "Missing directory: $path ($label)"
    exit 1
  fi
  local count
  count="$(find "$path" -type f -name "$name" 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$count" -eq 0 ]]; then
    echo "Missing $label: expected $name in $path"
    exit 1
  fi
}

run_base_checks() {
  if [[ "$SKIP_TESTS" != "true" ]]; then
    if ! command -v pnpm >/dev/null 2>&1; then
      echo "pnpm not found. Please install dependencies first."
      exit 1
    fi
    if node -e "const pkg=require('./package.json'); process.exit(pkg.scripts && pkg.scripts.test ? 0 : 1)"; then
      pnpm test
    else
      echo "SKIP: no test script found in package.json"
    fi
  fi
  pnpm lint
  pnpm tsc --noEmit

  local todo_count
  todo_count="$({ grep -R "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true; } | wc -l | tr -d ' ')"
  if [[ "$todo_count" -ne 0 ]]; then
    echo "Found TODO/FIXME in src/: $todo_count"
    exit 1
  fi
}

check_05a() {
  require_find "src/types" "*-server.ts" "server type files"
  require_find "src/types" "*-client.ts" "client type files"
  require_find "src/types/__tests__" "*.test.ts" "type tests"
  require_file "src/db/schema.ts"
  require_find "supabase/migrations" "*.sql" "migration files"
}

check_05b() {
  require_find "src/lib" "*-service.ts" "service files"
  require_find "src/app/api" "route.ts" "API routes"
  require_find "src/lib/__tests__" "*.test.ts" "service tests"
}

check_05c() {
  require_find "src/hooks" "use-*.ts" "hooks"
  require_find "src/components" "*.tsx" "components"
  require_find "src/app" "page.tsx" "pages"
  require_find "src/components" "*.test.tsx" "component tests"
}

check_06() {
  require_find "e2e" "*.spec.ts" "E2E tests"
}

case "$STAGE" in
  all)
    run_base_checks
    ;;
  05a)
    run_base_checks
    check_05a
    ;;
  05b)
    run_base_checks
    check_05b
    ;;
  05c)
    run_base_checks
    check_05c
    ;;
  06)
    run_base_checks
    check_06
    ;;
  07)
    run_base_checks
    ;;
  *)
    echo "Unknown stage: $STAGE"
    usage
    exit 1
    ;;
esac

echo "PASS: stage validation completed."

