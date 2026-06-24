#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs"

{
  echo "Checking ESLint generated-output ignore..."
  grep -F '"**/.cloudbase/**"' eslint.config.mjs
  echo
  echo "Checking generated-output documentation..."
  grep -F "Generated deployment output under \`apps/api/.cloudbase/\` is excluded from source lint" docs/cloudbase-dev-api-deployment.md
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Command: pnpm lint"
  pnpm lint
} > "${SCRIPT_DIR}/logs/lint.log" 2>&1

echo "Task 1.1 validation complete. Logs: ${SCRIPT_DIR}/logs"
