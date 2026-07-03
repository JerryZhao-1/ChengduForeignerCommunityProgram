#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../../.." && pwd)"
mkdir -p "$DIR/logs"
cd "$ROOT"
echo "Starting API on http://127.0.0.1:8787 and Admin on http://127.0.0.1:5173"
echo "GUI runbook: $DIR/tests/gui_runbook_admin_direct_gallery_upload.md"
NODE_OPTIONS=--no-experimental-require-module pnpm --filter @community-map/api exec tsx src/dev.ts >"$DIR/logs/api-dev.log" 2>&1 &
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @community-map/admin dev >"$DIR/logs/admin-dev.log" 2>&1 &
wait
