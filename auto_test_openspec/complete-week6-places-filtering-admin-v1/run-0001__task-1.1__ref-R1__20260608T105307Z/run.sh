#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs"
{
  echo "repo=$REPO_ROOT"
  echo "node=$(node --version)"
  echo "pnpm=$(corepack pnpm --version)"
  echo "+ corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts"
  corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
