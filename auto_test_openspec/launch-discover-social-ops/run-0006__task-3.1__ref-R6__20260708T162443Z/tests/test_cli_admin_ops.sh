#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${RUN_DIR}/../../.." && pwd)"
LOG_DIR="${RUN_DIR}/logs"
LOG_FILE="${LOG_DIR}/admin-ops-cli.log"

mkdir -p "${LOG_DIR}"
cd "${REPO_ROOT}"

{
  echo "Running admin ops CLI validation"
  echo "Repo: ${REPO_ROOT}"
  (cd apps/admin && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json)
  ./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts
} 2>&1 | tee "${LOG_FILE}"
