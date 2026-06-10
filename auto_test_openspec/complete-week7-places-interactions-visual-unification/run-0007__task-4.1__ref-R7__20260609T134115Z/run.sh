#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p logs
cd ../../..
LOG_DIR="auto_test_openspec/complete-week7-places-interactions-visual-unification/run-0007__task-4.1__ref-R7__20260609T134115Z/logs"
{
  echo "Command: pnpm --filter @community-map/mobile typecheck"
  pnpm --filter @community-map/mobile typecheck
  echo "Command: pnpm exec vitest run apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts"
  pnpm exec vitest run apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts
  echo "Command: places visible copy scan"
  if rg -n "pending|reserved|预留|后续版本|入口|Favorite entry|Share entry|Recommended entry" apps/mobile/src/pages/places apps/mobile/src/pages.json; then
    echo "Forbidden visible copy found"
    exit 1
  fi
  echo "Command: openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive"
  openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive
} 2>&1 | tee "$LOG_DIR/final-verification.log"
