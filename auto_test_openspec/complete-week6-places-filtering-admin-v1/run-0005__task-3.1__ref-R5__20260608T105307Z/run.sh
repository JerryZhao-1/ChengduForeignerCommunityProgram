#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs"
echo "Starting local service for MCP GUI validation."
echo "URL: http://127.0.0.1:5174/"
echo "Log: $SCRIPT_DIR/logs/dev-server.log"
corepack pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174 2>&1 | tee "$SCRIPT_DIR/logs/dev-server.log"
