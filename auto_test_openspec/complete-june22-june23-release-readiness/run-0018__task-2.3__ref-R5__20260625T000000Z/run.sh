#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

test -f "${SCRIPT_DIR}/outputs/preview-refresh.png"
test -f "${SCRIPT_DIR}/outputs/preview-refresh-info.json"
test -f "${SCRIPT_DIR}/logs/preview-refresh.md"

echo "Preview refresh QR is available at outputs/preview-refresh.png"

