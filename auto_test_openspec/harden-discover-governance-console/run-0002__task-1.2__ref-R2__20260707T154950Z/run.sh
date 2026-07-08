#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs"
./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tee "$SCRIPT_DIR/logs/api-typecheck.log"
./node_modules/.bin/vitest run apps/api/test/integration-readiness.spec.ts 2>&1 | tee "$SCRIPT_DIR/logs/api-tests.log"
