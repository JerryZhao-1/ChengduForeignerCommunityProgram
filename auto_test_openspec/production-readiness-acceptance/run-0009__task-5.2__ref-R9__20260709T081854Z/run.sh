#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

echo "Running focused Discover interaction tests..."
./node_modules/.bin/vitest run apps/api/test/cloudbase.spec.ts >"$SCRIPT_DIR/logs/vitest-cloudbase.log" 2>&1

echo "Running CloudBase near-concurrent Discover interaction smoke..."
node "$SCRIPT_DIR/tests/smoke-discover-interactions.mjs" >"$SCRIPT_DIR/logs/cloudbase-interactions.log" 2>&1

echo "Task 5.2 Discover interaction hardening checks completed. Outputs: $SCRIPT_DIR/outputs"
