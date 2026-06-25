#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

openspec validate complete-june22-june23-release-readiness --strict --no-interactive > "${SCRIPT_DIR}/logs/openspec-validate.log" 2>&1

{
  grep -F "Change 'complete-june22-june23-release-readiness' is valid" "${SCRIPT_DIR}/logs/openspec-validate.log"
  grep -F -- "- [ ] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]" openspec/changes/complete-june22-june23-release-readiness/tasks.md
  unchecked_count="$(grep -F -- "- [ ]" openspec/changes/complete-june22-june23-release-readiness/tasks.md | wc -l | tr -d " ")"
  if [ "${unchecked_count}" != "1" ]; then
    echo "Unexpected unchecked OpenSpec task count: ${unchecked_count}" >&2
    exit 1
  fi
  grep -F "Real-device places native navigation/permission fallback not yet complete" docs/release-readiness-handoff-2026-06-24.md
  test -d auto_test_openspec/complete-june22-june23-release-readiness/run-0019__task-2.3__ref-R5__20260625T000500Z
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Final OpenSpec validation passed."
  echo "Completed tasks: 8/9"
  echo "Remaining unchecked task: 2.3 native navigation/fallback evidence."
} > "${SCRIPT_DIR}/outputs/final-summary.txt"

cat "${SCRIPT_DIR}/outputs/final-summary.txt"
