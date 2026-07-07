#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
./node_modules/.bin/vitest run apps/api/test/integration-readiness.spec.ts 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0003__task-1.3__ref-R3__20260707T145642Z/logs/vitest-api.log
