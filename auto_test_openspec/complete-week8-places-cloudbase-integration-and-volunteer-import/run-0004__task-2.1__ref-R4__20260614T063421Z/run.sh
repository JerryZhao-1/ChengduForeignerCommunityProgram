#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && pnpm test -- packages/shared/test/contracts.spec.ts packages/shared/test/volunteer-import.spec.ts apps/api/test/app.spec.ts ) 2>&1 | tee "$RUN_DIR/logs/run.log"
