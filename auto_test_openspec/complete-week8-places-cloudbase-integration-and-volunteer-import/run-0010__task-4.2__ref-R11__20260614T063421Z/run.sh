#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && node -e "console.log('CloudBase function verification blocked: MCP AUTH_REQUIRED; /api route intentionally deferred')" ) 2>&1 | tee "$RUN_DIR/logs/run.log"
