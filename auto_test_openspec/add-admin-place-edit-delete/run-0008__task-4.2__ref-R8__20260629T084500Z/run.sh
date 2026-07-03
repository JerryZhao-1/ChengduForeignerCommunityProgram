#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
mkdir -p "$SCRIPT_DIR/logs"

{
  echo "change-id=add-admin-place-edit-delete run=0008 task=4.2 ref=R8"
  cd "$REPO_ROOT"
  openspec validate add-admin-place-edit-delete --strict --no-interactive
  test -f "docs/API接口使用手册.md"
  test -f "docs/已实现API接口清单.md"
  test -f "docs/openapi/community-map-api.openapi.yaml"
  pnpm typecheck
  pnpm test
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"

