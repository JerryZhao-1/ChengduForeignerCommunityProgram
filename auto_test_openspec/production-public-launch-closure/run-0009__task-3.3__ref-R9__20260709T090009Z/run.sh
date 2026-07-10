#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cat <<INFO
Admin GUI validation server command:
  cd "$REPO_ROOT" && VITE_API_MODE=http VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api pnpm --filter @community-map/admin dev --host 127.0.0.1 --port 5173

Admin URL:
  http://127.0.0.1:5173/

CLI static check:
  node "$SCRIPT_DIR/tests/test_cli_admin_public_launch.mjs"

GUI MCP runbook:
  $SCRIPT_DIR/tests/gui_runbook_admin_public_launch.md
INFO
