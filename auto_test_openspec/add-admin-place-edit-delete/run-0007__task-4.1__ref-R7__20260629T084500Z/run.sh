#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs"

{
  echo "change-id=add-admin-place-edit-delete run=0007 task=4.1 ref=R7"
  cd "$REPO_ROOT"
  pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts packages/shared/test/places-admin-lifecycle.spec.ts
  pnpm --filter @community-map/shared typecheck
  pnpm --filter @community-map/api typecheck
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"

