#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
{
  echo "node: $(node --version)"
  "$REPO_ROOT/node_modules/.bin/vitest" run "$REPO_ROOT/apps/api/test/integration-readiness.spec.ts"
  "$REPO_ROOT/node_modules/.bin/tsc" --noEmit -p "$REPO_ROOT/apps/api/tsconfig.json"
} 2>&1 | tee logs/run.log
