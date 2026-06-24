#!/usr/bin/env bash
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"
: > "${SCRIPT_DIR}/outputs/summary.txt"

run_check() {
  local label="$1"
  local log="$2"
  shift 2

  echo "Command: $*" > "${SCRIPT_DIR}/logs/${log}"
  "$@" >> "${SCRIPT_DIR}/logs/${log}" 2>&1
  local code=$?
  echo "${label}: exit ${code}" | tee -a "${SCRIPT_DIR}/outputs/summary.txt"
  return "${code}"
}

overall=0
run_check "typecheck" "typecheck.log" pnpm typecheck || overall=1
run_check "test" "test.log" pnpm test || overall=1
run_check "lint" "lint.log" pnpm lint || overall=1

echo "Logs: ${SCRIPT_DIR}/logs" | tee -a "${SCRIPT_DIR}/outputs/summary.txt"
exit "${overall}"
