#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 1.2 ref: R2"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''| `places` | 0 | 7 |'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q '| `places` | 0 | 7 |' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''idx_places_community_status'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'idx_places_community_status' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Static hosting:'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Static hosting:' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Function ID: `lam-igyxxjph`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Function ID: `lam-igyxxjph`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''APIId: `083b66e0-c43a-4af4-864f-f3a297353828`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'APIId: `083b66e0-c43a-4af4-864f-f3a297353828`' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
