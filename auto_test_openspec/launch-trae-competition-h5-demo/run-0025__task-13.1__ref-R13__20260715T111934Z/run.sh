#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  echo "=== R13 API typecheck ==="
  pnpm --filter @community-map/api typecheck
  echo "=== R13 API focused tests (community-plan, app, cloudbase) ==="
  pnpm exec vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts --reporter=json --outputFile="auto_test_openspec/launch-trae-competition-h5-demo/run-0025__task-13.1__ref-R13__20260715T111934Z/logs/vitest.json"
  echo "=== R13 shared engine tests (missing catalog) ==="
  pnpm exec vitest run packages/shared/test/community-plan-engine.spec.ts
  echo "=== R13 eslint on modified test file ==="
  pnpm exec eslint apps/api/test/community-plan.spec.ts
  echo "All R13 CLI assertions completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
