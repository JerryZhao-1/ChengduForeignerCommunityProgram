#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs

{
  cd "$REPO_DIR"
  pnpm --filter @community-map/api typecheck
  pnpm exec vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
  echo "All R13 CLI assertions completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"

