#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  echo "=== R17 run-0038 post-GUI-fix CLI gate: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "HEAD: $(git rev-parse --short HEAD)"
  echo ""

  echo "=== [1/9] openspec validate ==="
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  echo ""

  echo "=== [2/9] shared typecheck ==="
  pnpm --filter @community-map/shared typecheck
  echo ""

  echo "=== [3/9] api typecheck ==="
  pnpm --filter @community-map/api typecheck
  echo ""

  echo "=== [4/9] mobile typecheck ==="
  pnpm --filter @community-map/mobile typecheck
  echo ""

  echo "=== [5/9] root typecheck ==="
  pnpm typecheck
  echo ""

  echo "=== [6/9] pnpm test ==="
  pnpm test
  echo ""

  echo "=== [7/9] pnpm lint ==="
  pnpm lint
  echo ""

  echo "=== [8/9] mobile build:h5 ==="
  pnpm --filter @community-map/mobile build:h5
  echo ""

  echo "=== [9/9] mobile build:mp-weixin ==="
  pnpm --filter @community-map/mobile build:mp-weixin
  echo ""

  echo "=== Focused coverage, parity, locale, and session tests ==="
  ./node_modules/.bin/vitest run \
    packages/shared/test/community-plan-engine.spec.ts \
    packages/shared/test/community-plans.spec.ts \
    apps/mobile/src/api/community-plan-adapter.spec.ts \
    apps/mobile/src/stores/onboarding-store.spec.ts \
    apps/mobile/src/i18n/catalog.spec.ts
  echo ""

  echo "=== Build artifact existence ==="
  test -f apps/mobile/dist/build/h5/index.html
  echo "h5/index.html: OK"
  test -f apps/mobile/dist/build/mp-weixin/app.json
  echo "mp-weixin/app.json: OK"
  echo ""

  echo "=== Forbidden model-runtime marker scan ==="
  set +e
  rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" \
    apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 \
    --glob '!**/*.map'
  scan_status=$?
  set -e
  case "$scan_status" in
    0)
      echo "Found a forbidden Community Plan model-runtime artifact."
      exit 1
      ;;
    1)
      echo "No forbidden markers found (rg exit 1)."
      ;;
    *)
      echo "Forbidden-marker scan failed to execute (rg exit $scan_status)."
      exit "$scan_status"
      ;;
  esac
  echo ""

  echo "=== Scoped production change and consolidated checks ==="
  node "$BUNDLE_DIR/tests/write-checks.mjs" "$BUNDLE_DIR/outputs/checks.json"
  cmp "$BUNDLE_DIR/outputs/checks.json" "$BUNDLE_DIR/expected/checks.json"
  echo "checks.json matches expected."
  echo ""

  echo "=== R17 run-0038 CLI gate complete; Supervisor verdict follows from this immutable transcript. ==="
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
