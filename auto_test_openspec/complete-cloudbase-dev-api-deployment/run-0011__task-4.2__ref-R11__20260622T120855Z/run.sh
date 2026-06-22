#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 4.2 ref: R11"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ openspec validate complete-cloudbase-dev-api-deployment --strict --no-interactive'
  openspec validate complete-cloudbase-dev-api-deployment --strict --no-interactive
  echo '+ pnpm --filter @community-map/api typecheck'
  pnpm --filter @community-map/api typecheck
  echo '+ pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts'
  pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
  echo '+ test -d auto_test_openspec/complete-cloudbase-dev-api-deployment'
  test -d auto_test_openspec/complete-cloudbase-dev-api-deployment
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
