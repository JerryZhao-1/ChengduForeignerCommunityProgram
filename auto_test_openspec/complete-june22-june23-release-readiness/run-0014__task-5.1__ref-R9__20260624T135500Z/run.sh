#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

openspec validate complete-june22-june23-release-readiness --strict --no-interactive > "${SCRIPT_DIR}/logs/openspec-validate.log" 2>&1

{
  echo "Checking updated task status..."
  grep -F -- "- [x] 2.2 Verify WeChat DevTools import and main flow or record a blocker [#R4]" openspec/changes/complete-june22-june23-release-readiness/tasks.md
  grep -F -- "- [ ] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]" openspec/changes/complete-june22-june23-release-readiness/tasks.md
  grep -F -- "- [x] 3.1 Verify Admin hosting reaches the intended CloudBase dev API domain [#R6]" openspec/changes/complete-june22-june23-release-readiness/tasks.md
  echo
  echo "Checking evidence bundle folders..."
  test -d auto_test_openspec/complete-june22-june23-release-readiness/run-0011__task-3.1__ref-R6__20260624T134916Z
  test -d auto_test_openspec/complete-june22-june23-release-readiness/run-0012__task-2.2__ref-R4__20260624T134916Z
  test -d auto_test_openspec/complete-june22-june23-release-readiness/run-0013__task-2.3__ref-R5__20260624T134916Z
  grep -F "Change 'complete-june22-june23-release-readiness' is valid" "${SCRIPT_DIR}/logs/openspec-validate.log"
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "Final OpenSpec validation recheck passed."
  echo "Completed tasks: 8/9"
  echo "Remaining unchecked task: 2.3 real-device places map/navigation/share verification."
} > "${SCRIPT_DIR}/outputs/final-summary.txt"

cat "${SCRIPT_DIR}/outputs/final-summary.txt"
