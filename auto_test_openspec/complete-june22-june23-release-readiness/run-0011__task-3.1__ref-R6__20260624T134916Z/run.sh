#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs" "${SCRIPT_DIR}/tests"

ADMIN_ROOT="https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/"
ADMIN_PLACES="https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/places"
API_HEALTH="https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health"
API_BASE="https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api"

curl -L -sS -D "${SCRIPT_DIR}/logs/root.headers" -o "${SCRIPT_DIR}/logs/root.html" "${ADMIN_ROOT}"
curl -L -sS -D "${SCRIPT_DIR}/logs/places.headers" -o "${SCRIPT_DIR}/logs/places.html" "${ADMIN_PLACES}"
curl -sS -D "${SCRIPT_DIR}/logs/api-health.headers" -o "${SCRIPT_DIR}/logs/api-health.json" "${API_HEALTH}"

{
  echo "Checking hosted Admin root..."
  grep -F "HTTP/2 200" "${SCRIPT_DIR}/logs/root.headers"
  grep -F "Community Map Admin" "${SCRIPT_DIR}/logs/root.html"
  echo
  echo "Checking hosted Admin /places route fallback..."
  grep -F "HTTP/2 200" "${SCRIPT_DIR}/logs/places.headers"
  grep -F "Community Map Admin" "${SCRIPT_DIR}/logs/places.html"
  echo
  echo "Checking dev API health..."
  grep -E "HTTP/[0-9.]+ 200|HTTP/2 200" "${SCRIPT_DIR}/logs/api-health.headers"
  grep -F '{"ok":true}' "${SCRIPT_DIR}/logs/api-health.json"
  echo
  echo "Checking built Admin API target..."
  grep -R -l -F "${API_BASE}" apps/admin/dist/assets
  if grep -R -F "127.0.0.1:8787" apps/admin/dist/assets; then
    echo "Unexpected localhost API target found in Admin bundle" >&2
    exit 1
  fi
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Admin hosting verification passed."
  echo "Hosted URL: ${ADMIN_ROOT}"
  echo "Direct route URL: ${ADMIN_PLACES}"
  echo "API base: ${API_BASE}"
} > "${SCRIPT_DIR}/outputs/summary.txt"

cat "${SCRIPT_DIR}/outputs/summary.txt"
