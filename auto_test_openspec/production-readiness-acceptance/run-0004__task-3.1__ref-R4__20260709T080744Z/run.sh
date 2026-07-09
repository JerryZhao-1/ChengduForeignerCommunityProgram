#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

cat <<INFO
Task 3.1 GUI validation entrypoints

Mini Program project:
  $REPO_ROOT/apps/mobile/dist/build/mp-weixin

API target:
  https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api

Runbook:
  $SCRIPT_DIR/tests/gui_runbook_places_share.md

Static CLI check:
  node $SCRIPT_DIR/tests/test_cli_places_share_static.mjs

Expected GUI outputs:
  $SCRIPT_DIR/outputs/places-share-detail-loaded.png
  $SCRIPT_DIR/outputs/places-share-native-panel.png
  $SCRIPT_DIR/outputs/places-share-console.log
  $SCRIPT_DIR/outputs/places-share-result.json
INFO

