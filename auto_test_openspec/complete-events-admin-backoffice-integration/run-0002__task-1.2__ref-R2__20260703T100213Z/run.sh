#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
{
  echo "== api typecheck =="
  cd "$REPO_ROOT"
  corepack pnpm --filter @community-map/api typecheck
  echo "== api route and cloudbase tests =="
  corepack pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
} 2>&1 | tee logs/run.log
