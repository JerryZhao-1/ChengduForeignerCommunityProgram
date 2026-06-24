#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

echo "MIXED scope: this script does not perform GUI automation or mutate hosted state."
echo "Use MCP/approved GUI tooling with: ${SCRIPT_DIR}/tests/gui_runbook_admin_hosting_api.md"
echo "Observed blocker record: ${SCRIPT_DIR}/logs/observed-http.md"
