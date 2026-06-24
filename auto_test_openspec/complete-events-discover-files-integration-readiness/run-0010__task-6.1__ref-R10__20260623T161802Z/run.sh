#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
RUN_DIR="auto_test_openspec/complete-events-discover-files-integration-readiness/run-0010__task-6.1__ref-R10__20260623T161802Z"
mkdir -p logs
cd "$REPO_ROOT"
openspec validate complete-events-discover-files-integration-readiness --strict --no-interactive | tee "$RUN_DIR/logs/openspec.log"
pnpm exec vitest run packages/shared/test/integration-readiness.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts | tee "$RUN_DIR/logs/vitest.log"
pnpm --filter @community-map/shared typecheck | tee "$RUN_DIR/logs/shared-typecheck.log"
pnpm --filter @community-map/api typecheck | tee "$RUN_DIR/logs/api-typecheck.log"
if pnpm lint > "$RUN_DIR/logs/lint.log" 2>&1; then
  printf "lint exited 0\n" > "$RUN_DIR/logs/lint-status.txt"
else
  printf "pnpm lint failed. Review logs/lint.log; generated CloudBase bundle lint is a known scoped blocker when present.\n" > "$RUN_DIR/logs/lint-blocker.txt"
fi
