#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && openspec validate complete-week8-places-cloudbase-integration-and-volunteer-import --strict --no-interactive && pnpm typecheck && pnpm test && pnpm lint ) 2>&1 | tee "$RUN_DIR/logs/run.log"
