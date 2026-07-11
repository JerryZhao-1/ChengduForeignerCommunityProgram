#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
cd "$REPO_ROOT"
./node_modules/.bin/vitest run \
  apps/api/test/bilingual-publication-guards.spec.ts \
  apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts \
  apps/api/test/integration-readiness.spec.ts \
  packages/shared/test/bilingual-contracts.spec.ts \
  packages/shared/test/places-admin-lifecycle.spec.ts \
  packages/shared/test/places-marker-contract.spec.ts \
  >"$SCRIPT_DIR/logs/publication-tests.log" 2>&1
TEST_EXIT=$?
pnpm --filter @community-map/api typecheck >"$SCRIPT_DIR/logs/api-typecheck.log" 2>&1
API_EXIT=$?
pnpm --filter @community-map/shared typecheck >"$SCRIPT_DIR/logs/shared-typecheck.log" 2>&1
SHARED_EXIT=$?
node "$SCRIPT_DIR/tests/summarize.mjs" "$TEST_EXIT" "$API_EXIT" "$SHARED_EXIT" "$SCRIPT_DIR/outputs/result.json" "$SCRIPT_DIR/outputs/mutation-snapshots.json"
if [ "$TEST_EXIT" -ne 0 ] || [ "$API_EXIT" -ne 0 ] || [ "$SHARED_EXIT" -ne 0 ]; then exit 1; fi
