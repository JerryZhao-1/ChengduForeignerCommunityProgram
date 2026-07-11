#!/usr/bin/env bash
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
cd "$REPO_ROOT"

./node_modules/.bin/vitest run \
  packages/shared/test/bilingual-contracts.spec.ts \
  packages/shared/test/contracts.spec.ts \
  packages/shared/test/places-marker-contract.spec.ts \
  >"$SCRIPT_DIR/logs/focused-shared-tests.log" 2>&1
TEST_EXIT=$?

pnpm --filter @community-map/shared typecheck \
  >"$SCRIPT_DIR/logs/shared-typecheck.log" 2>&1
TYPECHECK_EXIT=$?

node "$SCRIPT_DIR/tests/summarize.mjs" \
  "$TEST_EXIT" "$TYPECHECK_EXIT" "$SCRIPT_DIR/outputs/result.json"

if [ "$TEST_EXIT" -ne 0 ] || [ "$TYPECHECK_EXIT" -ne 0 ]; then
  exit 1
fi
