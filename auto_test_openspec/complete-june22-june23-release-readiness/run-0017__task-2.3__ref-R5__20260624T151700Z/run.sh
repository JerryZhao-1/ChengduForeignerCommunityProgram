#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

{
  echo "Checking switchTab retest evidence files..."
  test -f "${SCRIPT_DIR}/logs/device-evidence.md"
  test -f "${SCRIPT_DIR}/outputs/map-position-button-still-inert.jpg"
  test -f "${SCRIPT_DIR}/outputs/preview-switchtab.png"
  test -f "${SCRIPT_DIR}/outputs/preview-switchtab-info.json"
  echo
  echo "Checking source and build use switchTab for tabBar map page..."
  grep -F "PLACE_MAP_FOCUS_STORAGE_KEY" apps/mobile/src/pages/places/navigation.ts
  grep -F "uni.switchTab" apps/mobile/src/pages/places/detail.vue
  grep -F "consumePendingFocusPlace" apps/mobile/src/pages/places/map.vue
  grep -F "switchTab" apps/mobile/dist/build/mp-weixin/pages/places/detail.js
  grep -F "getStorageSync" apps/mobile/dist/build/mp-weixin/pages/places/map.js
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Task 2.3 remains pending switchTab retest."
  echo "Root cause recorded: map is a tabBar page and cannot be opened via navigateTo."
  echo "New preview QR recorded under outputs/preview-switchtab.png."
} > "${SCRIPT_DIR}/outputs/summary.txt"

cat "${SCRIPT_DIR}/outputs/summary.txt"

