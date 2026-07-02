#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
API_LOG="$LOG_DIR/api-dev.log"
MOBILE_LOG="$LOG_DIR/mobile-h5-dev.log"

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

cleanup() {
  if [[ -n "${API_PID:-}" ]]; then
    kill "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "API URL: http://127.0.0.1:8787"
echo "Mobile H5 URL: http://127.0.0.1:5174/#/pages/places/map"

corepack pnpm --filter @community-map/api dev > "$API_LOG" 2>&1 &
API_PID=$!

VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 \
  corepack pnpm --filter @community-map/mobile dev:h5 > "$MOBILE_LOG" 2>&1
