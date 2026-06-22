#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 4.1 ref: R10"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''Remaining Work'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Remaining Work' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''导入或创建最小 live places 数据'\'' docs/plan.md'
  grep -q '导入或创建最小 live places 数据' docs/plan.md
  echo '+ grep -q '\''完整 places live acceptance'\'' docs/Postman调试与OpenAPI导入指南.md'
  grep -q '完整 places live acceptance' docs/Postman调试与OpenAPI导入指南.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
