#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
{
  echo "== shared typecheck =="
  cd "$REPO_ROOT"
  corepack pnpm --filter @community-map/shared typecheck
  echo "== shared event admin contract tests =="
  corepack pnpm exec vitest run \
    packages/shared/test/contracts.spec.ts \
    packages/shared/test/client.spec.ts \
    packages/shared/test/integration-readiness.spec.ts
} 2>&1 | tee logs/run.log
