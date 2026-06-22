#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 1.1 ref: R1"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''Auth: `READY`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Auth: `READY`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Bound env: `cloud1-d7gxdk8t43bd639c0`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Bound env: `cloud1-d7gxdk8t43bd639c0`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Region: `ap-shanghai`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Region: `ap-shanghai`' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
