#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
{
  cd "$REPO_ROOT"
  corepack pnpm exec vitest run \
    packages/shared/test/integration-readiness.spec.ts \
    packages/shared/test/client.spec.ts \
    apps/api/test/app.spec.ts
} 2>&1 | tee logs/run.log
