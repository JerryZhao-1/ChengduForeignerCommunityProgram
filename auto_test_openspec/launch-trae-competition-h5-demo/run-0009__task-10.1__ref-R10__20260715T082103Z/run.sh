#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs

{
  cd "$REPO_DIR"
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  test ! -e apps/api/src/lib/community-plan-ai.ts
  if rg -n "community-plan-ai|DEEPSEEK|deepseek|generation_source|ai_status" apps/api/src apps/mobile/src packages/shared/src; then
    echo "Found a stale Community Plan model-runtime claim."
    exit 1
  fi
  echo "All R10 CLI assertions completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"

