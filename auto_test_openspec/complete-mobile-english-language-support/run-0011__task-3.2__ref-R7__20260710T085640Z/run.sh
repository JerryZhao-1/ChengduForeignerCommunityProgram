#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
echo "H5 URL: http://127.0.0.1:5174"
echo "Admin URL: http://127.0.0.1:5173/events"
pnpm --filter @community-map/mobile exec uni --force &
MOBILE_PID=$!
pnpm --filter @community-map/admin exec vite --host 127.0.0.1 &
ADMIN_PID=$!
trap 'kill "$MOBILE_PID" "$ADMIN_PID" 2>/dev/null || true' INT TERM EXIT
wait
