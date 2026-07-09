#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/admin-server.log"

mkdir -p "${LOG_DIR}" "${SCRIPT_DIR}/outputs/screenshots"
cd "${REPO_ROOT}/apps/admin"

echo "Starting Admin for MCP content ops validation" | tee "${LOG_FILE}"
echo "URL: http://localhost:5173/posts" | tee -a "${LOG_FILE}"
VITE_API_MODE=http VITE_API_BASE_URL=http://127.0.0.1:8787 ./node_modules/.bin/vite --host 127.0.0.1 2>&1 | tee -a "${LOG_FILE}"
