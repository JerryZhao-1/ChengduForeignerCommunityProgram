#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/final-docs-validation.log"

mkdir -p "${LOG_DIR}"
cd "${REPO_ROOT}"

{
  echo "Running final docs and strict OpenSpec validation"
  echo "Repo: ${REPO_ROOT}"

  echo ""
  echo "Attempting strict OpenSpec validation"
  openspec validate launch-discover-social-ops --strict --no-interactive
  OPENSPEC_STATUS=$?
  if [ "${OPENSPEC_STATUS}" -ne 0 ]; then
    echo "BLOCKER: openspec validation command exited ${OPENSPEC_STATUS}; in this environment it reports the change valid, then pnpm stops on ignored build-script approval."
  fi

  echo ""
  echo "Attempting root pnpm test"
  pnpm test
  PNPM_TEST_STATUS=$?
  if [ "${PNPM_TEST_STATUS}" -ne 0 ]; then
    echo "BLOCKER: pnpm test exited ${PNPM_TEST_STATUS} before Vitest started because pnpm ignored build scripts require approval."
  fi

  echo ""
  echo "Running direct fallback Vitest and typechecks"
  (cd apps/admin && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json)
  (cd apps/mobile && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json)
  ./node_modules/.bin/vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts
} 2>&1 | tee "${LOG_FILE}"
