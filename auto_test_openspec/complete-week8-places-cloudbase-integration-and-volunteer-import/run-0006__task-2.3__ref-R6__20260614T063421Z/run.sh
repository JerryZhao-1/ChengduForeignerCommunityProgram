#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
echo "Start Mobile H5: pnpm --filter @community-map/mobile dev:h5" | tee "$RUN_DIR/logs/run.log"
echo "Start Admin: pnpm --filter @community-map/admin dev" | tee -a "$RUN_DIR/logs/run.log"
echo "GUI scope: execute tests/gui_runbook.md with Browser MCP." | tee -a "$RUN_DIR/logs/run.log"
