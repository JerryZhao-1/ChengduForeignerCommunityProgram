#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
RUN_DIR="$(pwd)"
REPO_ROOT="$(cd ../../.. && pwd)"
{
  echo "node: $(node --version)"
  cd "$REPO_ROOT"
  openspec validate --type change connect-discover-to-community-modules --strict --no-interactive
  "$REPO_ROOT/node_modules/.bin/vitest" run "$REPO_ROOT/packages/shared/test/contracts.spec.ts" "$REPO_ROOT/packages/shared/test/client.spec.ts" "$REPO_ROOT/packages/shared/test/integration-readiness.spec.ts" "$REPO_ROOT/apps/api/test/integration-readiness.spec.ts"
  "$REPO_ROOT/node_modules/.bin/tsc" --noEmit -p "$REPO_ROOT/packages/shared/tsconfig.json"
  "$REPO_ROOT/node_modules/.bin/tsc" --noEmit -p "$REPO_ROOT/apps/api/tsconfig.json"
  "$REPO_ROOT/node_modules/.pnpm/node_modules/.bin/vue-tsc" --noEmit -p "$REPO_ROOT/apps/mobile/tsconfig.json"
} 2>&1 | tee "$RUN_DIR/logs/run.log"
