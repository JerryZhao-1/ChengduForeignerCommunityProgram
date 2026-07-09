#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

echo "Running Events API acceptance smoke..."
node "$SCRIPT_DIR/tests/smoke-events-acceptance.mjs" >"$SCRIPT_DIR/logs/events-acceptance.log" 2>&1

cat <<INFO
Task 4.1 Events acceptance CLI smoke completed.

Mini Program project:
  $REPO_ROOT/apps/mobile/dist/build/mp-weixin

Admin Web:
  https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/

GUI runbook:
  $SCRIPT_DIR/tests/gui_runbook_events_acceptance.md

Outputs:
  $SCRIPT_DIR/outputs
INFO

