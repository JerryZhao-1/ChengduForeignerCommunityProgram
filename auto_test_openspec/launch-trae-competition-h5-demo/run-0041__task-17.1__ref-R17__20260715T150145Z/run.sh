#!/usr/bin/env bash
set -euo pipefail

RUN_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$RUN_DIR/../../.." && pwd)"
EXPECTED_HEAD="775ede097bc3c65cd1772749cbc5d2f228e3fd35"

run_checks() {
  cd "$ROOT_DIR"
  echo "=== R17 run-0041 current-HEAD release gate ==="
  test "$(git rev-parse HEAD)" = "$EXPECTED_HEAD"
  echo "Validated HEAD: $EXPECTED_HEAD"
  echo "Working tree changes under validation:"
  git status --short

  echo "=== Strict OpenSpec validation ==="
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  echo "=== API typecheck ==="
  pnpm --filter @community-map/api typecheck
  echo "=== Focused Community Plan API tests ==="
  ./node_modules/.bin/vitest run apps/api/test/community-plan.spec.ts
  echo "=== Root typecheck ==="
  pnpm typecheck
  echo "=== Repository tests ==="
  pnpm test
  echo "=== Lint ==="
  pnpm lint
  echo "=== H5 build ==="
  pnpm --filter @community-map/mobile build:h5
  echo "=== mp-weixin build ==="
  pnpm --filter @community-map/mobile build:mp-weixin

  echo "=== Privacy source assertion ==="
  if rg -n 'scenario_key' apps/api/src/routes/community-plan.ts; then
    echo "Raw scenario_key remains in the generation route."
    return 1
  fi
  echo "Generation route contains no scenario_key log field."

  echo "=== Current commit type-suppression assertion ==="
  if git show --unified=0 --format= HEAD -- '*.ts' '*.tsx' '*.vue' | rg '^\+.*(as any|@ts-ignore|@ts-nocheck)'; then
    echo "Forbidden type-suppression escape added by current commit."
    return 1
  fi
  echo "No forbidden type-suppression escape added by current commit."

  node "$RUN_DIR/tests/write-checks.mjs" "$RUN_DIR/outputs/checks.json"
  cmp "$RUN_DIR/expected/checks.json" "$RUN_DIR/outputs/checks.json"
  echo "checks.json matches expected."
  echo "=== Worker validation complete; Supervisor verdict remains pending ==="
}

run_checks 2>&1 | tee "$RUN_DIR/logs/run.log"
