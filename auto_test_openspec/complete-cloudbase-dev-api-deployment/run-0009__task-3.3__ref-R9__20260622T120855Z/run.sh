#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 3.3 ref: R9"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''API_PROVIDER=cloudbase'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'API_PROVIDER=cloudbase' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''CLOUDBASE_PROVIDER_MODE=live'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'CLOUDBASE_PROVIDER_MODE=live' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''Live `places` collection query returned `total=0`'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Live `places` collection query returned `total=0`' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''mock provider currently returns two places locally'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'mock provider currently returns two places locally' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
