#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
node scripts/check-bilingual-docs.mjs | tee "$SCRIPT_DIR/outputs/documentation-check.json"
DOC_EXIT=${PIPESTATUS[0]}
pnpm exec prettier --check docs/mobile-bilingual-operations-and-release.md docs/ui-guidelines.md docs/openapi/community-map-api.openapi.yaml scripts/check-bilingual-docs.mjs 2>&1 | tee "$SCRIPT_DIR/logs/format.log"
FORMAT_EXIT=${PIPESTATUS[0]}
openspec validate complete-mobile-english-language-support --strict --no-interactive 2>&1 | tee "$SCRIPT_DIR/logs/openspec.log"
SPEC_EXIT=${PIPESTATUS[0]}
if [ "$DOC_EXIT" -eq 0 ] && [ "$FORMAT_EXIT" -eq 0 ] && [ "$SPEC_EXIT" -eq 0 ]; then exit 0; fi
exit 1
