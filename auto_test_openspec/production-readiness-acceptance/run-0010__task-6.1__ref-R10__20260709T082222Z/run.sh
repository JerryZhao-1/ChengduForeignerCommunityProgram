#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

echo "Running production-preview config/media scan..."
node "$SCRIPT_DIR/tests/test_cli_config_media.mjs" >"$SCRIPT_DIR/logs/config-media-scan.log" 2>&1

cat <<INFO
Task 6.1 config/media scan completed.

Mini Program project:
  $REPO_ROOT/apps/mobile/dist/build/mp-weixin

GUI runbook:
  $SCRIPT_DIR/tests/gui_runbook_config_media.md

Outputs:
  $SCRIPT_DIR/outputs
INFO

