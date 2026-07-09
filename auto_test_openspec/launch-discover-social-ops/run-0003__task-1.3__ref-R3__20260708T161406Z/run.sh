#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/vitest-profile-follow.log"

mkdir -p "${LOG_DIR}"
cd "${REPO_ROOT}"

{
  echo "Running discover profile/follow validation"
  echo "Repo: ${REPO_ROOT}"
  ./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts
} 2>&1 | tee "${LOG_FILE}"
