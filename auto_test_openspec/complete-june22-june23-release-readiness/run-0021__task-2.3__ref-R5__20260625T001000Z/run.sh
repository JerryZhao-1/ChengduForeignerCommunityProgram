#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "GUI evidence bundle for task 2.3 final real-device verification."
echo "Evidence notes: ${SCRIPT_DIR}/logs/device-evidence.md"
echo "Summary: ${SCRIPT_DIR}/outputs/summary.txt"

