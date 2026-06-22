#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 3.1 ref: R7"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''Access path: `/api`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Access path: `/api`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''APIId: `083b66e0-c43a-4af4-864f-f3a297353828`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'APIId: `083b66e0-c43a-4af4-864f-f3a297353828`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''EnableAuth: `false`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'EnableAuth: `false`' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
