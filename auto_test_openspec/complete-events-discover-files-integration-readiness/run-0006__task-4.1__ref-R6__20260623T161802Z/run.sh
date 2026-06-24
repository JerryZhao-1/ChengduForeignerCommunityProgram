#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts -t "enforces file upload" | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0006__task-4.1__ref-R6__20260623T161802Z/logs/vitest.log"
