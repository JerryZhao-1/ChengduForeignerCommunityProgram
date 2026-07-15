#!/usr/bin/env bash
set -euo pipefail

RUN_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$RUN_DIR/../../.." && pwd)"

run_checks() {
  cd "$ROOT_DIR"
  echo "=== R17 run-0040 privacy-fix validation ==="
  echo "Base HEAD: $(git rev-parse HEAD)"
  echo "Working tree changes under validation:"
  git status --short

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
  echo "=== Strict OpenSpec validation ==="
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive

  echo "=== Privacy source assertion ==="
  if rg -n 'scenario_key' apps/api/src/routes/community-plan.ts; then
    echo "Raw scenario_key remains in the generation route."
    return 1
  fi
  echo "Generation route contains no scenario_key log field."

  echo "=== Added-line type-suppression assertion ==="
  if git diff --unified=0 HEAD -- '*.ts' '*.tsx' '*.vue' | rg '^\+.*(as any|@ts-ignore|@ts-nocheck)'; then
    echo "Added type-suppression escape found."
    return 1
  fi
  echo "No added type-suppression escape found."

  node "$RUN_DIR/tests/write-checks.mjs" "$RUN_DIR/outputs/checks.json"
  cmp "$RUN_DIR/expected/checks.json" "$RUN_DIR/outputs/checks.json"
  echo "checks.json matches expected."
  echo "=== Worker validation complete; Supervisor verdict remains pending ==="
}

run_checks 2>&1 | tee "$RUN_DIR/logs/run.log"
