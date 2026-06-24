#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts -t "cloudbase handler parity|cloudbase event handler" | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0008__task-5.1__ref-R8__20260623T161802Z/logs/vitest.log"
