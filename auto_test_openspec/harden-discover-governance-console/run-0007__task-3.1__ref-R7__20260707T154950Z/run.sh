#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs"
openspec validate harden-discover-governance-console --strict --no-interactive 2>&1 | tee "$SCRIPT_DIR/logs/openspec-validate.log"
./node_modules/.bin/tsc --noEmit -p packages/shared/tsconfig.json 2>&1 | tee "$SCRIPT_DIR/logs/shared-typecheck.log"
./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tee "$SCRIPT_DIR/logs/api-typecheck.log"
./apps/admin/node_modules/.bin/vue-tsc --noEmit -p apps/admin/tsconfig.json 2>&1 | tee "$SCRIPT_DIR/logs/admin-typecheck.log"
./apps/mobile/node_modules/.bin/vue-tsc --noEmit -p apps/mobile/tsconfig.json 2>&1 | tee "$SCRIPT_DIR/logs/mobile-typecheck.log"
./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts 2>&1 | tee "$SCRIPT_DIR/logs/focused-tests.log"
