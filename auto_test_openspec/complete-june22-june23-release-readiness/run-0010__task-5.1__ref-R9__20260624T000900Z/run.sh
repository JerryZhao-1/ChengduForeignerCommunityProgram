#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

{
  echo "Command: openspec validate complete-june22-june23-release-readiness --strict --no-interactive"
  openspec validate complete-june22-june23-release-readiness --strict --no-interactive
} > "${SCRIPT_DIR}/logs/openspec-validate.log" 2>&1

TASKS="openspec/changes/complete-june22-june23-release-readiness/tasks.md"
ROOT="auto_test_openspec/complete-june22-june23-release-readiness"

{
  echo "Checking completed-task evidence..."
  test -d "${ROOT}/run-0002__task-1.1__ref-R1__20260624T000100Z/logs"
  test -d "${ROOT}/run-0003__task-1.2__ref-R2__20260624T000200Z/logs"
  test -d "${ROOT}/run-0004__task-2.1__ref-R3__20260624T000300Z/logs"
  test -d "${ROOT}/run-0008__task-4.1__ref-R7__20260624T000700Z/logs"
  test -d "${ROOT}/run-0009__task-4.2__ref-R8__20260624T000800Z/logs"
  test -d "${ROOT}/run-0010__task-5.1__ref-R9__20260624T000900Z/logs"
  echo
  echo "Checking blocker evidence..."
  test -f "${ROOT}/run-0005__task-2.2__ref-R4__20260624T000400Z/logs/blocker.md"
  test -f "${ROOT}/run-0006__task-2.3__ref-R5__20260624T000500Z/logs/blocker.md"
  test -f "${ROOT}/run-0007__task-3.1__ref-R6__20260624T000600Z/logs/observed-http.md"
  echo
  echo "Checking task status..."
  grep -F -- "- [x] 1.1 Scope generated CloudBase deployment output out of source lint [#R1]" "${TASKS}"
  grep -F -- "- [x] 1.2 Run release validation commands after lint blocker closure [#R2]" "${TASKS}"
  grep -F -- "- [x] 2.1 Build the Mini Program in \`cloudbase-function\` mode [#R3]" "${TASKS}"
  grep -F -- "- [ ] 2.2 Verify WeChat DevTools import and main flow or record a blocker [#R4]" "${TASKS}"
  grep -F -- "- [ ] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]" "${TASKS}"
  grep -F -- "- [ ] 3.1 Verify Admin hosting reaches the intended CloudBase dev API domain [#R6]" "${TASKS}"
  grep -F -- "- [x] 4.1 Clean or classify dev data and freeze release configuration [#R7]" "${TASKS}"
  grep -F -- "- [x] 4.2 Publish the 6.24 integration handoff and update \`docs/plan.md\` [#R8]" "${TASKS}"
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

{
  echo "OpenSpec strict validation passed."
  echo "Completed tasks with evidence: 1.1, 1.2, 2.1, 4.1, 4.2, 5.1."
  echo "Blocked tasks left unchecked with evidence: 2.2, 2.3, 3.1."
} > "${SCRIPT_DIR}/outputs/final-summary.txt"

cat "${SCRIPT_DIR}/outputs/final-summary.txt"
