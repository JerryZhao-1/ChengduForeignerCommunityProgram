#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p packages/shared/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0001__task-1.1__ref-R1__20260707T145642Z/logs/typecheck.log
./node_modules/.bin/vitest run packages/shared/test 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0001__task-1.1__ref-R1__20260707T145642Z/logs/vitest-shared.log
