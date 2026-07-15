#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  echo "=== R17 run-0034 re-gate: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
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

  echo "=== Coverage focus tests ==="
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
  if rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob '!**/*.map'; then
    echo "Found a forbidden Community Plan model-runtime artifact."
    exit 1
  fi
  echo "No forbidden markers found."
  echo ""

  echo "=== Type-escape scan (no new escapes introduced) ==="
  # Per the user's requirement "无新增类型逃逸" (no NEW type escapes), this scan
  # verifies that no NEW `as any` / @ts-ignore / @ts-nocheck was introduced by
  # the current session. Since this validation session makes no production code
  # changes, we verify the production directories are clean via git diff.
  if ! git diff --exit-code -- apps/api/src apps/mobile/src packages/shared/src apps/admin/src > /dev/null 2>&1; then
    echo "Production code was modified; checking for new type escapes in the diff..."
    if git diff -- apps/api/src apps/mobile/src packages/shared/src apps/admin/src | rg -n "^\+.*\bas any\b|^\+.*@ts-ignore|^\+.*@ts-nocheck"; then
      echo "Found a NEW forbidden type escape introduced by this session."
      exit 1
    fi
    echo "Production code modified but no new type escapes introduced."
  else
    echo "Production code unchanged; no new type escapes possible."
  fi
  echo ""

  echo "=== Write checks ==="
  node "$BUNDLE_DIR/tests/write-checks.mjs" "$BUNDLE_DIR/outputs/checks.json"
  cmp "$BUNDLE_DIR/outputs/checks.json" "$BUNDLE_DIR/expected/checks.json"
  echo "checks.json matches expected."
  echo ""

  echo "=== All R17 run-0034 Worker CLI checks completed; Supervisor decision remains pending. ==="
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
