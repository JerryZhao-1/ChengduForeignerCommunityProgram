#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "GUI verification bundle for task 2.3."
echo "Existing evidence notes: ${SCRIPT_DIR}/logs/device-evidence.md"
echo "Runbook: ${SCRIPT_DIR}/tests/gui_runbook_real_device_places.md"
echo "No local service is started by this bundle; use the preview QR referenced in the runbook."
