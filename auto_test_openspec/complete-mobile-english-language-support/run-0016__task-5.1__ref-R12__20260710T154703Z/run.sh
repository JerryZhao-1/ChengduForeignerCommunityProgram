#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
FAIL=0
run_logged() {
  NAME="$1"
  shift
  "$@" > "$SCRIPT_DIR/logs/$NAME.log" 2>&1
  CODE=$?
  echo "$CODE" > "$SCRIPT_DIR/logs/$NAME.exit"
  if [ "$CODE" -ne 0 ]; then FAIL=1; fi
}
node --version > "$SCRIPT_DIR/logs/tool-versions.log"
pnpm --version >> "$SCRIPT_DIR/logs/tool-versions.log"
run_logged typecheck pnpm typecheck
run_logged test pnpm test
run_logged lint pnpm lint
run_logged admin-build env VITE_API_MODE=http VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api pnpm --filter @community-map/admin build
run_logged h5-build env VITE_API_MODE=http VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api pnpm --filter @community-map/mobile build:h5
run_logged mp-weixin-build env VITE_API_MODE=cloudbase-function VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api pnpm --filter @community-map/mobile build:mp-weixin
run_logged docs-check node scripts/check-bilingual-docs.mjs
run_logged content-audit-tests pnpm exec vitest run scripts/bilingual-content-audit.spec.ts packages/shared/test/bilingual-contracts.spec.ts
run_logged artifact-scan env PUBLIC_LAUNCH_OUTPUT_DIR="$SCRIPT_DIR/outputs" node scripts/public_launch_verify.mjs artifact-scan
if rg -n "vue-router/dist/vue-router\.esm-bundler|Phase 1|Phase1|Skeleton|mock data|DTO|已接入|已连通|example\.com/public/events|https?://(?:localhost|127\.0\.0\.1)|x-mock-user-id" apps/mobile/dist/build/h5 > "$SCRIPT_DIR/logs/h5-static-scan.log" 2>&1; then
  echo 1 > "$SCRIPT_DIR/logs/h5-static-scan.exit"
  FAIL=1
else
  echo 0 > "$SCRIPT_DIR/logs/h5-static-scan.exit"
fi
if git status --short --untracked-files=all -- apps/mobile/dist apps/admin/dist > "$SCRIPT_DIR/logs/generated-tree-status.log" && [ ! -s "$SCRIPT_DIR/logs/generated-tree-status.log" ]; then
  echo 0 > "$SCRIPT_DIR/logs/generated-tree-status.exit"
else
  echo 1 > "$SCRIPT_DIR/logs/generated-tree-status.exit"
  FAIL=1
fi
exit "$FAIL"
