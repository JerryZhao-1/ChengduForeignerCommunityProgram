#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  node --version
  pnpm --version
  pnpm typecheck
  pnpm test
  pnpm lint
  pnpm --filter @community-map/mobile build:h5
  pnpm --filter @community-map/mobile build:mp-weixin
  ./node_modules/.bin/vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts
  ./node_modules/.bin/prettier --check openspec/changes/launch-trae-competition-h5-demo/proposal.md openspec/changes/launch-trae-competition-h5-demo/design.md openspec/changes/launch-trae-competition-h5-demo/tasks.md openspec/changes/launch-trae-competition-h5-demo/specs/community-plan-generation/spec.md openspec/changes/launch-trae-competition-h5-demo/specs/competition-release-evidence/spec.md docs/competition/README.md docs/competition/trae-ai-free-handoff-prompts.md packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  test -f apps/mobile/dist/build/h5/index.html
  test -f apps/mobile/dist/build/mp-weixin/app.json
  if rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob '!**/*.map'; then
    echo "Found a forbidden Community Plan model-runtime artifact."
    exit 1
  fi
  node "$BUNDLE_DIR/tests/write-checks.mjs" "$BUNDLE_DIR/outputs/checks.json"
  cmp "$BUNDLE_DIR/outputs/checks.json" "$BUNDLE_DIR/expected/checks.json"
  echo "All R17 worker checks completed; Supervisor decision remains pending."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
