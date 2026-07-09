#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/vitest-shared-contracts.log"

mkdir -p "${LOG_DIR}"
cd "${REPO_ROOT}"

{
  echo "Running shared discover social contract validation"
  echo "Repo: ${REPO_ROOT}"
  ./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts
} 2>&1 | tee "${LOG_FILE}"
