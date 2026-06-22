#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 2.1 ref: R4"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ pnpm --filter @community-map/api build:cloudbase-http'
  pnpm --filter @community-map/api build:cloudbase-http
  echo '+ test -f apps/api/.cloudbase/community-map-api/index.js'
  test -f apps/api/.cloudbase/community-map-api/index.js
  echo '+ test -x apps/api/.cloudbase/community-map-api/scf_bootstrap'
  test -x apps/api/.cloudbase/community-map-api/scf_bootstrap
  echo '+ grep -q '\''/var/lang/node18/bin/node index.js'\'' apps/api/.cloudbase/community-map-api/scf_bootstrap'
  grep -q '/var/lang/node18/bin/node index.js' apps/api/.cloudbase/community-map-api/scf_bootstrap
  echo '+ grep -q '\''type="HTTP"'\'' apps/api/.cloudbase/community-map-api/README.md'
  grep -q 'type="HTTP"' apps/api/.cloudbase/community-map-api/README.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
