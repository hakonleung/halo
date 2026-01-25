#!/usr/bin/env bash
set -euo pipefail

WORK_DIR=""
MIN_RATE="0.95"

usage() {
  cat <<'EOF'
Usage:
  flow-sync-check.sh [--work-dir <path>] [--min-rate <0-1>]

Examples:
  bash ai-coding/scripts/flow-sync-check.sh
  bash ai-coding/scripts/flow-sync-check.sh --work-dir ai-coding/works/PRD_001 --min-rate 0.95
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -w|--work-dir)
      WORK_DIR="${2:-}"
      shift 2
      ;;
    -m|--min-rate)
      MIN_RATE="${2:-}"
      shift 2
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

if [[ -z "$WORK_DIR" && -d "ai-coding/works" ]]; then
  WORK_DIR="$(ls -dt ai-coding/works/* 2>/dev/null | head -1 || true)"
fi

if [[ -z "$WORK_DIR" ]]; then
  echo "No work dir found, skipping sync check."
  exit 0
fi

if [[ ! -d "$WORK_DIR" ]]; then
  echo "Work dir not found: $WORK_DIR"
  exit 1
fi

DOC_API="$WORK_DIR/04_tech_design/api-spec.md"
DOC_TECH="$WORK_DIR/04_tech_design/tech-design.md"
DOC_UI_DIR="$WORK_DIR/03_ui_design/components"

count_grep() {
  local pattern="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    grep -cE "$pattern" "$file" || true
  else
    echo 0
  fi
}

count_find() {
  local path="$1"
  local name="$2"
  if [[ -d "$path" ]]; then
    find "$path" -type f -name "$name" 2>/dev/null | wc -l | tr -d ' '
  else
    echo 0
  fi
}

api_doc_count="$(count_grep "^### (GET|POST|PUT|DELETE)" "$DOC_API")"
api_code_count="$(count_find "src/app/api" "route.ts")"

type_doc_count="$(count_grep "^(interface|type) " "$DOC_TECH")"
type_code_count="$(grep -R -E "^(export )?(interface|type) " src/types --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')"

ui_doc_count="$(count_find "$DOC_UI_DIR" "*.md")"
ui_code_count="$(find src/components -type f -name "*.tsx" ! -path "*/__tests__/*" 2>/dev/null | wc -l | tr -d ' ')"

calc_ratio() {
  local doc="$1"
  local code="$2"
  if [[ "$doc" -le 0 || "$code" -le 0 ]]; then
    echo "0"
    return
  fi
  if (( doc > code )); then
    awk "BEGIN {printf \"%.4f\", $code/$doc}"
  else
    awk "BEGIN {printf \"%.4f\", $doc/$code}"
  fi
}

sum="0"
count=0

add_metric() {
  local name="$1"
  local doc="$2"
  local code="$3"
  if [[ "$doc" -gt 0 && "$code" -gt 0 ]]; then
    local ratio
    ratio="$(calc_ratio "$doc" "$code")"
    sum="$(awk "BEGIN {print $sum + $ratio}")"
    count=$((count + 1))
    printf "%s: doc=%s code=%s rate=%s\n" "$name" "$doc" "$code" "$ratio"
  else
    printf "%s: doc=%s code=%s rate=SKIP\n" "$name" "$doc" "$code"
  fi
}

add_metric "API" "$api_doc_count" "$api_code_count"
add_metric "Types" "$type_doc_count" "$type_code_count"
add_metric "UI" "$ui_doc_count" "$ui_code_count"

if [[ "$count" -eq 0 ]]; then
  echo "No comparable metrics found, skipping sync check."
  exit 0
fi

overall="$(awk "BEGIN {printf \"%.4f\", $sum / $count}")"
echo "Overall sync rate: $overall (min $MIN_RATE)"

pass="$(awk "BEGIN {print ($overall >= $MIN_RATE) ? 1 : 0}")"
if [[ "$pass" -ne 1 ]]; then
  echo "FAIL: sync rate below threshold."
  exit 1
fi

echo "PASS: sync rate meets threshold."

