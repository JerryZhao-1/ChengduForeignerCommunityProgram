#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

echo "GUI scope: scan outputs/preview.png with a physical WeChat-capable device and follow tests/gui_runbook_real_device_places.md."
test -f "${SCRIPT_DIR}/outputs/preview.png"
test -f "${SCRIPT_DIR}/outputs/preview-info.json"
test -f "${SCRIPT_DIR}/outputs/device-context.txt"
echo "Task 2.3 remains pending real-device evidence."
