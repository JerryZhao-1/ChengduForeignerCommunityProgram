#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 2.2 ref: R5"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''Type: `HTTP`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Type: `HTTP`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Runtime: `Nodejs18.15`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Runtime: `Nodejs18.15`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Latest code update RequestId: `70783676-7336-48f1-a9cd-926b68e396cf`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Latest code update RequestId: `70783676-7336-48f1-a9cd-926b68e396cf`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Function ID: `lam-igyxxjph`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Function ID: `lam-igyxxjph`' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
