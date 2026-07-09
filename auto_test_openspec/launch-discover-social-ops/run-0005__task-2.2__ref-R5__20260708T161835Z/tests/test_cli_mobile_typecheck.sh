#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${RUN_DIR}/../../.." && pwd)"
LOG_DIR="${RUN_DIR}/logs"
LOG_FILE="${LOG_DIR}/mobile-typecheck.log"

mkdir -p "${LOG_DIR}"
cd "${REPO_ROOT}/apps/mobile"

{
  echo "Running mobile typecheck"
  echo "Repo: ${REPO_ROOT}"
  ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
} 2>&1 | tee "${LOG_FILE}"
