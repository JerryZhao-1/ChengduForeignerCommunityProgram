#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
echo "API URL: http://127.0.0.1:8787"
echo "Admin URL: http://localhost:5173 (mock client)"
NODE_OPTIONS=--no-experimental-require-module pnpm --filter @community-map/api exec tsx src/dev.ts &
API_PID=$!
pnpm --filter @community-map/admin dev &
ADMIN_PID=$!
trap 'kill "$API_PID" "$ADMIN_PID" 2>/dev/null || true' INT TERM EXIT
wait
