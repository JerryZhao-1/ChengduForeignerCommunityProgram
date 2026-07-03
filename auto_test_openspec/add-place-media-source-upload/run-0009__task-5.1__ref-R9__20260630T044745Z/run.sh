#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"
mkdir -p "$DIR/logs"
openspec validate add-place-media-source-upload --strict --no-interactive >"$DIR/logs/openspec-validate.log" 2>&1
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/packages/shared/tsconfig.json" >"$DIR/logs/shared-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/apps/api/tsconfig.json" >"$DIR/logs/api-typecheck.log" 2>&1
"$ROOT/apps/admin/node_modules/.bin/vue-tsc" --noEmit -p "$ROOT/apps/admin/tsconfig.json" >"$DIR/logs/admin-typecheck.log" 2>&1
"$ROOT/apps/mobile/node_modules/.bin/vue-tsc" --noEmit -p "$ROOT/apps/mobile/tsconfig.json" >"$DIR/logs/mobile-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/vitest" run "$ROOT/packages/shared/test/contracts.spec.ts" "$ROOT/packages/shared/test/client.spec.ts" "$ROOT/apps/api/test/app.spec.ts" "$ROOT/apps/api/test/cloudbase.spec.ts" >"$DIR/logs/vitest.log" 2>&1
test -f "$ROOT/docs/API接口使用手册.md"
test -f "$ROOT/docs/已实现API接口清单.md"
test -f "$ROOT/docs/Postman调试与OpenAPI导入指南.md"
echo "Task 5.1 final CLI checks completed. Logs: $DIR/logs"
