#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts -t "rejects invalid actors" | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0007__task-4.2__ref-R7__20260623T161802Z/logs/vitest.log"
