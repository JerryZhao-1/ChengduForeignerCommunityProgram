#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

{
  echo "Checking retest evidence files..."
  test -f "${SCRIPT_DIR}/logs/device-evidence.md"
  test -f "${SCRIPT_DIR}/outputs/preview-mapbutton.png"
  test -f "${SCRIPT_DIR}/outputs/preview-mapbutton-info.json"
  echo
  echo "Checking map-position button is no longer disabled in source and build..."
  grep -F "@click=\"openMapPosition\"" apps/mobile/src/pages/places/detail.vue
  if grep -F ':disabled="!hasUsableCoordinates"' apps/mobile/src/pages/places/detail.vue; then
    echo "Unexpected disabled binding remains on map-position button" >&2
    exit 1
  fi
  grep -F "openMapPosition" apps/mobile/src/pages/places/detail.vue
  grep -F "placesPagePaths.map" apps/mobile/dist/build/mp-weixin/pages/places/detail.js
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Task 2.3 remains pending map-position retest."
  echo "Share limitation recorded as accepted platform limitation: Mini Program is not certified."
  echo "New preview QR recorded under outputs/preview-mapbutton.png."
} > "${SCRIPT_DIR}/outputs/summary.txt"

cat "${SCRIPT_DIR}/outputs/summary.txt"

