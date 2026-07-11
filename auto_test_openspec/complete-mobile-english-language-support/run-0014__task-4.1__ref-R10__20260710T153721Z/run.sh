#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
pnpm exec vitest run scripts/bilingual-content-audit.spec.ts packages/shared/test/bilingual-contracts.spec.ts 2>&1 | tee "$SCRIPT_DIR/logs/tests.log"
TEST_EXIT=${PIPESTATUS[0]}
pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --types node --strict --skipLibCheck scripts/bilingual-content-audit.ts scripts/bilingual-content-migration.ts 2>&1 | tee "$SCRIPT_DIR/logs/typecheck.log"
TYPECHECK_EXIT=${PIPESTATUS[0]}
pnpm --filter @community-map/api exec tsx "$REPO_ROOT/scripts/bilingual-content-audit.ts" --input "$REPO_ROOT/scripts/fixtures/bilingual-content-audit/valid-production-candidate.json" --output "$SCRIPT_DIR/outputs/valid-production-shaped-audit.json" > "$SCRIPT_DIR/logs/valid-audit.log" 2>&1
VALID_EXIT=$?
pnpm --filter @community-map/api exec tsx "$REPO_ROOT/scripts/bilingual-content-audit.ts" --input "$REPO_ROOT/scripts/fixtures/bilingual-content-audit/valid-fixture.json" --output "$SCRIPT_DIR/outputs/valid-fixture-audit.json" > "$SCRIPT_DIR/logs/fixture-audit.log" 2>&1
FIXTURE_EXIT=$?
pnpm --filter @community-map/api exec tsx "$REPO_ROOT/scripts/bilingual-content-audit.ts" --input "$REPO_ROOT/scripts/fixtures/bilingual-content-audit/invalid-production-candidate.json" --output "$SCRIPT_DIR/outputs/invalid-production-shaped-audit.json" > "$SCRIPT_DIR/logs/invalid-audit.log" 2>&1
INVALID_EXIT=$?
pnpm --filter @community-map/api exec tsx "$REPO_ROOT/scripts/bilingual-content-migration.ts" --input "$REPO_ROOT/scripts/fixtures/bilingual-content-audit/legacy-backfill.json" --scope all --report "$SCRIPT_DIR/outputs/migration-dry-run.json" > "$SCRIPT_DIR/logs/migration.log" 2>&1
MIGRATION_EXIT=$?
if [ "$TEST_EXIT" -eq 0 ] && [ "$TYPECHECK_EXIT" -eq 0 ] && [ "$VALID_EXIT" -eq 0 ] && [ "$FIXTURE_EXIT" -eq 0 ] && [ "$INVALID_EXIT" -eq 1 ] && [ "$MIGRATION_EXIT" -eq 0 ]; then
  exit 0
fi
exit 1
