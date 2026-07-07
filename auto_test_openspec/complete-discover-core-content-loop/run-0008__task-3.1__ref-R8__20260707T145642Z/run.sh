#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
cd "$ROOT"
openspec validate complete-discover-core-content-loop --strict --no-interactive 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0008__task-3.1__ref-R8__20260707T145642Z/logs/openspec.log
./node_modules/.bin/tsc --noEmit -p packages/shared/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0008__task-3.1__ref-R8__20260707T145642Z/logs/shared-typecheck.log
./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0008__task-3.1__ref-R8__20260707T145642Z/logs/api-typecheck.log
apps/mobile/node_modules/.bin/vue-tsc --noEmit -p apps/mobile/tsconfig.json 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0008__task-3.1__ref-R8__20260707T145642Z/logs/mobile-typecheck.log
./node_modules/.bin/vitest run packages/shared/test apps/api/test apps/mobile/src/api/client.spec.ts apps/mobile/src/pages/events/event-signup-state.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts 2>&1 | tee auto_test_openspec/complete-discover-core-content-loop/run-0008__task-3.1__ref-R8__20260707T145642Z/logs/vitest.log
