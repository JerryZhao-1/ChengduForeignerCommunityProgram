#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts -t "filters public posts" | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0004__task-3.1__ref-R4__20260623T161802Z/logs/vitest.log"
