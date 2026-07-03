#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
RUN_DIR="$(pwd)"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs/screenshots"
cd "$REPO_ROOT"
echo "API: http://127.0.0.1:8787" | tee "$RUN_DIR/logs/server.log"
echo "Admin: http://127.0.0.1:5173/events" | tee -a "$RUN_DIR/logs/server.log"
echo "Mobile H5: http://127.0.0.1:5174/#/pages/events/index" | tee -a "$RUN_DIR/logs/server.log"
env NODE_OPTIONS=--no-experimental-require-module corepack pnpm --filter @community-map/api exec tsx src/dev.ts > "$RUN_DIR/logs/api.log" 2>&1 &
API_PID=$!
env VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 corepack pnpm --filter @community-map/admin exec vite --host 127.0.0.1 --port 5173 > "$RUN_DIR/logs/admin.log" 2>&1 &
ADMIN_PID=$!
env VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 corepack pnpm --filter @community-map/mobile exec uni --host 127.0.0.1 --port 5174 > "$RUN_DIR/logs/mobile.log" 2>&1 &
MOBILE_PID=$!
trap 'kill "$API_PID" "$ADMIN_PID" "$MOBILE_PID" 2>/dev/null || true' EXIT
wait
