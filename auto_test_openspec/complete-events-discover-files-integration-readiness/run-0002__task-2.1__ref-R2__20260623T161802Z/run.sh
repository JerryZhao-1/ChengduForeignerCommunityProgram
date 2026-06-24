#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts -t "keeps public event reads|cloudbase handler parity" | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0002__task-2.1__ref-R2__20260623T161802Z/logs/vitest.log"
