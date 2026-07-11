#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

echo "API URL: http://127.0.0.1:8787"
echo "Admin URL: http://localhost:5173"

pnpm dev:api &
API_PID=$!
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @community-map/admin dev &
ADMIN_PID=$!

trap 'kill "$API_PID" "$ADMIN_PID" 2>/dev/null || true' INT TERM EXIT
wait
