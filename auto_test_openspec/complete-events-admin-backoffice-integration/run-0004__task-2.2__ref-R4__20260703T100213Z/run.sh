#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
{
  cd "$REPO_ROOT"
  corepack pnpm exec vitest run \
    apps/api/test/integration-readiness.spec.ts \
    packages/shared/test/integration-readiness.spec.ts
} 2>&1 | tee logs/run.log
