#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"
mkdir -p "$DIR/logs"
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/apps/api/tsconfig.json" >"$DIR/logs/api-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/vitest" run "$ROOT/apps/api/test/app.spec.ts" >"$DIR/logs/api-app-tests.log" 2>&1
echo "Task 2.1 CLI checks completed. Logs: $DIR/logs"
