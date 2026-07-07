#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
apps/mobile/node_modules/.bin/vue-tsc --noEmit -p apps/mobile/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0007__task-2.3__ref-R7__20260707T145642Z/logs/mobile-typecheck.log
