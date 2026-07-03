#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$RUN_DIR/../../.." && pwd)"
LOG_DIR="$RUN_DIR/logs"

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

openspec validate add-map-marker-cover-preview --strict --no-interactive \
  > "$LOG_DIR/openspec-validate.log" 2>&1

./node_modules/.bin/vitest run \
  packages/shared/test/places-marker-contract.spec.ts \
  packages/shared/test/contracts.spec.ts \
  packages/shared/test/client.spec.ts \
  apps/api/test/app.spec.ts \
  apps/api/test/cloudbase.spec.ts \
  > "$LOG_DIR/focused-regression.log" 2>&1

corepack pnpm --filter @community-map/mobile typecheck \
  > "$LOG_DIR/mobile-typecheck.log" 2>&1

cat "$LOG_DIR/openspec-validate.log"
cat "$LOG_DIR/focused-regression.log"
cat "$LOG_DIR/mobile-typecheck.log"
