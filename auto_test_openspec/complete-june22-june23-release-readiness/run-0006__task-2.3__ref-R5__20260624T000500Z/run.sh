#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

echo "GUI scope: no browser or device automation is executed by this script."
echo "Use MCP/approved device evidence collection with: ${SCRIPT_DIR}/tests/gui_runbook_real_device_places.md"
echo "Existing blocker record: ${SCRIPT_DIR}/logs/blocker.md"
