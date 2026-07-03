#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs"

{
  echo "change-id=add-admin-place-edit-delete run=0002 task=1.2 ref=R2"
  cd "$REPO_ROOT"
  pnpm exec vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts
  pnpm --filter @community-map/shared typecheck
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"

