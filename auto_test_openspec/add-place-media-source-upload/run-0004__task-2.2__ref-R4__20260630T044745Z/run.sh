#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"
mkdir -p "$DIR/logs"
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/packages/shared/tsconfig.json" >"$DIR/logs/shared-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/apps/api/tsconfig.json" >"$DIR/logs/api-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/vitest" run "$ROOT/packages/shared/test/contracts.spec.ts" "$ROOT/apps/api/test/app.spec.ts" "$ROOT/apps/api/test/cloudbase.spec.ts" >"$DIR/logs/external-media-tests.log" 2>&1
echo "Task 2.2 CLI checks completed. Logs: $DIR/logs"
