#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  pnpm typecheck
  pnpm test
  pnpm lint
  pnpm --filter @community-map/mobile build:h5
  pnpm --filter @community-map/mobile build:mp-weixin
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  test -f apps/mobile/dist/build/h5/index.html
  test -f apps/mobile/dist/build/mp-weixin/app.json
  if rg -n "community-plan-ai|DEEPSEEK|deepseek|generation_source|ai_status" apps/api/src apps/mobile/src packages/shared/src apps/mobile/dist/build/h5; then
    echo "Found a forbidden Community Plan model-runtime artifact."
    exit 1
  fi
  node "$BUNDLE_DIR/tests/write-checks.mjs" "$BUNDLE_DIR/outputs/checks.json"
  echo "All R17 worker checks completed; Supervisor decision remains pending."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"

