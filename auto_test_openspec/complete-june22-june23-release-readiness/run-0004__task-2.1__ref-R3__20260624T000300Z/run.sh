#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

{
  echo "Command: VITE_API_MODE=cloudbase-function VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api pnpm --filter @community-map/mobile build:mp-weixin"
  VITE_API_MODE=cloudbase-function \
    VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 \
    VITE_CLOUDBASE_FUNCTION_NAME=community-map-api \
    pnpm --filter @community-map/mobile build:mp-weixin
} > "${SCRIPT_DIR}/logs/build.log" 2>&1

OUTPUT_DIR="${REPO_ROOT}/apps/mobile/dist/build/mp-weixin"
test -d "${OUTPUT_DIR}"
test -f "${OUTPUT_DIR}/app.js"
test -f "${OUTPUT_DIR}/app.json"

printf "%s\n" "${OUTPUT_DIR}" > "${SCRIPT_DIR}/outputs/import-path.txt"
find "${OUTPUT_DIR}" -maxdepth 2 -type f | sort > "${SCRIPT_DIR}/outputs/generated-files.txt"

echo "Mini Program build complete. Import path: ${OUTPUT_DIR}"
