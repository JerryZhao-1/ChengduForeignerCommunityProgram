#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

{
  echo "Checking physical-device evidence files..."
  test -f "${SCRIPT_DIR}/logs/device-evidence.md"
  test -f "${SCRIPT_DIR}/outputs/iphone-14-pro-map-url-error.png"
  test -f "${SCRIPT_DIR}/outputs/preview-urlfix.png"
  test -f "${SCRIPT_DIR}/outputs/preview-urlfix-info.json"
  echo
  echo "Checking URL runtime fix in source and generated Mini Program package..."
  grep -F "resolveCloudbaseFunctionPath" apps/mobile/src/api/client.ts
  grep -F "resolveCloudbaseFunctionPath" apps/mobile/dist/build/mp-weixin/api/client.js
  if grep -F "new URL(" apps/mobile/src/api/client.ts apps/mobile/dist/build/mp-weixin/api/client.js; then
    echo "Unexpected browser URL constructor remains in mobile CloudBase requester" >&2
    exit 1
  fi
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Task 2.3 remains pending retest."
  echo "Initial real-device evidence recorded: app launch, places list, and places map reachable."
  echo "Observed blocker: Can't find variable: URL."
  echo "Fix build and preview QR recorded under outputs/preview-urlfix.png."
} > "${SCRIPT_DIR}/outputs/summary.txt"

cat "${SCRIPT_DIR}/outputs/summary.txt"

