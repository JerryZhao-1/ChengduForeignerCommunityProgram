#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run packages/shared/test/integration-readiness.spec.ts | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0001__task-1.1__ref-R1__20260623T161802Z/logs/vitest.log"
