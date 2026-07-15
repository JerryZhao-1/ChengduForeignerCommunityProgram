#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  pnpm --filter @community-map/shared typecheck
  pnpm exec vitest run packages/shared/test/community-plan-engine.spec.ts --reporter=json --outputFile="$BUNDLE_DIR/outputs/vitest.json"
  node "$BUNDLE_DIR/tests/verify-vitest.mjs" "$BUNDLE_DIR/outputs/vitest.json"
  echo "All R12 CLI assertions completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"

