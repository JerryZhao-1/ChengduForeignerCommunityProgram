#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

echo "GUI scope: no browser automation is executed by this script."
echo "Use MCP/approved GUI tooling with: ${SCRIPT_DIR}/tests/gui_runbook_wechat_devtools_import.md"
echo "Import path: /Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin"
echo "Existing blocker record: ${SCRIPT_DIR}/logs/blocker.md"
