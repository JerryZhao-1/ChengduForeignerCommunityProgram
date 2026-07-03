#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"
mkdir -p "$DIR/logs"
"$ROOT/node_modules/.bin/tsc" --noEmit -p "$ROOT/packages/shared/tsconfig.json" >"$DIR/logs/shared-typecheck.log" 2>&1
"$ROOT/node_modules/.bin/vitest" run "$ROOT/packages/shared/test/contracts.spec.ts" >"$DIR/logs/shared-contracts.log" 2>&1
echo "Task 1.1 CLI checks completed. Logs: $DIR/logs"
