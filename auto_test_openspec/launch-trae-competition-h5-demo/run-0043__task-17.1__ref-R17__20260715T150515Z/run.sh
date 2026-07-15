#!/usr/bin/env bash
set -euo pipefail
RUN_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$RUN_DIR/../../.." && pwd)"
cd "$ROOT_DIR"
run_checks() {
  test "$(git rev-parse HEAD)" = "775ede097bc3c65cd1772749cbc5d2f228e3fd35"
  test "$(git diff --name-only -- apps/api/src)" = "apps/api/src/deploy-shared.ts"
  test "$(git diff -- apps/api/src/deploy-shared.ts | shasum -a 256 | awk '{print $1}')" = "0c4bcfb159d0a8ff5a56da32b442b68c064d02414faffbd0d62e78590a100443"
  git diff --check
  pnpm --filter @community-map/api build:cloudbase-http
  test -s apps/api/.cloudbase/community-map-api/index.cjs
  pnpm --filter @community-map/api typecheck
  ./node_modules/.bin/vitest run apps/api/test/community-plan.spec.ts
  pnpm typecheck
  pnpm test
  pnpm lint
  pnpm --filter @community-map/mobile build:h5
  pnpm --filter @community-map/mobile build:mp-weixin
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  if git diff --unified=0 -- apps/api/src/deploy-shared.ts | rg '^\+.*(as any|@ts-ignore|@ts-nocheck)'; then return 1; fi
  node "$RUN_DIR/tests/write-checks.mjs" "$RUN_DIR/outputs/checks.json"
  cmp "$RUN_DIR/expected/checks.json" "$RUN_DIR/outputs/checks.json"
}
run_checks 2>&1 | tee "$RUN_DIR/logs/run.log"
