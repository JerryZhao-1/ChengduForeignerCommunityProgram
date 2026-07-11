#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
echo "H5 URL: http://localhost:5174"
echo "API URL: http://127.0.0.1:8787"
NODE_OPTIONS=--no-experimental-require-module pnpm --filter @community-map/api exec tsx src/dev.ts &
API_PID=$!
pnpm --filter @community-map/mobile dev:h5 -- --force &
MOBILE_PID=$!
trap 'kill "$API_PID" "$MOBILE_PID" 2>/dev/null || true' INT TERM EXIT
wait
