#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs

{
  cd "$REPO_DIR"
  pnpm --filter @community-map/shared typecheck
  pnpm exec vitest run packages/shared/test/community-plans.spec.ts packages/shared/test/client.spec.ts
  echo "All R11 CLI assertions completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"

