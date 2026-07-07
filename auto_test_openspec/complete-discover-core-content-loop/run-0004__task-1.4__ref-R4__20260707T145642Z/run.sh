#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0004__task-1.4__ref-R4__20260707T145642Z/logs/typecheck.log
./node_modules/.bin/vitest run apps/api/test/cloudbase.spec.ts 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0004__task-1.4__ref-R4__20260707T145642Z/logs/vitest-cloudbase.log
