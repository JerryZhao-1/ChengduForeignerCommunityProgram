#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

cat <<INFO
Task 3.3 GUI validation entrypoints

Canonical WeChat DevTools import path:
  $REPO_ROOT/apps/mobile/dist/build/mp-weixin

API target:
  https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api

Runbook:
  $SCRIPT_DIR/tests/gui_runbook_mini_program_tabs.md

Static CLI check:
  node $SCRIPT_DIR/tests/test_cli_mini_program_tabs_static.mjs

Expected GUI outputs:
  tab-home.png, tab-events.png, tab-discover.png, tab-places.png, tab-me.png
  platform-network-domains.json
  platform-console.log
  platform-capabilities-result.json
INFO

