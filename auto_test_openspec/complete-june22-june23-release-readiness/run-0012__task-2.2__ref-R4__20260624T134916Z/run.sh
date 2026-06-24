#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

echo "GUI scope: WeChat DevTools evidence is recorded in logs/gui-evidence.md."
test -f "${SCRIPT_DIR}/logs/gui-evidence.md"
test -f "${SCRIPT_DIR}/outputs/import-context.txt"
test -f "${SCRIPT_DIR}/outputs/preview-info.json"
test -f "${SCRIPT_DIR}/outputs/preview.png"
echo "Task 2.2 GUI evidence files exist."
