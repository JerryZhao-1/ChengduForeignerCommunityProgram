#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0002__task-1.2__ref-R2__20260707T145642Z/logs/typecheck.log
./node_modules/.bin/vitest run apps/api/test 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0002__task-1.2__ref-R2__20260707T145642Z/logs/vitest-api.log
