#!/usr/bin/env bash
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

cd "$REPO_ROOT"

./node_modules/.bin/vitest run \
  apps/mobile/src/i18n/catalog.spec.ts \
  apps/mobile/src/pages/events/event-signup-state.spec.ts \
  >"$SCRIPT_DIR/logs/focused-tests.log" 2>&1
TEST_EXIT=$?

pnpm --filter @community-map/mobile typecheck \
  >"$SCRIPT_DIR/logs/mobile-typecheck.log" 2>&1
TYPECHECK_EXIT=$?

if rg -n '[一-鿿]' apps/mobile/src/pages/events/event-signup-state.ts \
  >"$SCRIPT_DIR/logs/domain-copy-scan.log" 2>&1; then
  SCAN_EXIT=1
else
  SCAN_EXIT=0
fi

node "$SCRIPT_DIR/tests/summarize.mjs" \
  "$TEST_EXIT" "$TYPECHECK_EXIT" "$SCAN_EXIT" "$SCRIPT_DIR/outputs/result.json"

if [ "$TEST_EXIT" -ne 0 ] || [ "$TYPECHECK_EXIT" -ne 0 ] || [ "$SCAN_EXIT" -ne 0 ]; then
  exit 1
fi
