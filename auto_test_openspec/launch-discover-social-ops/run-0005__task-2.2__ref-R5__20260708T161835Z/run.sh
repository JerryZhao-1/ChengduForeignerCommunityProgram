#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/mobile-h5-server.log"

mkdir -p "${LOG_DIR}" "${SCRIPT_DIR}/outputs/screenshots"
cd "${REPO_ROOT}/apps/mobile"

echo "Starting Mobile H5 for MCP profile validation" | tee "${LOG_FILE}"
echo "URL: http://localhost:5174/#/pages/more/profile?id=user_002" | tee -a "${LOG_FILE}"
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 ./node_modules/.bin/uni 2>&1 | tee -a "${LOG_FILE}"
