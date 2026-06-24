#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

HANDOFF="docs/release-readiness-handoff-2026-06-24.md"
PLAN="docs/plan.md"

{
  echo "Checking handoff sections..."
  grep -F "## Entry Points" "${HANDOFF}"
  grep -F "## Validation Results" "${HANDOFF}"
  grep -F "## Data Classification" "${HANDOFF}"
  grep -F "## Blockers" "${HANDOFF}"
  grep -F "## 6.24 Go/No-Go" "${HANDOFF}"
  echo
  echo "Checking evidence links and blockers..."
  grep -F "run-0003__task-1.2__ref-R2" "${HANDOFF}"
  grep -F "run-0004__task-2.1__ref-R3" "${HANDOFF}"
  grep -F "run-0005__task-2.2__ref-R4" "${HANDOFF}"
  grep -F "run-0006__task-2.3__ref-R5" "${HANDOFF}"
  grep -F "run-0007__task-3.1__ref-R6" "${HANDOFF}"
  grep -F "| P0 | WeChat DevTools import/main flow not verified" "${HANDOFF}"
  grep -F "| P0 | Real-device places map/navigation/share not verified" "${HANDOFF}"
  grep -F "| P0 | Admin hosted domain returns \`404 NoSuchKey\`" "${HANDOFF}"
  echo
  echo "Checking plan references and checkbox state..."
  grep -F "docs/release-readiness-handoff-2026-06-24.md" "${PLAN}"
  grep -F -- "- [x] 小程序 cloudbase-function 构建。" "${PLAN}"
  grep -F -- "- [ ] 微信开发者工具导入并跑主流程。" "${PLAN}"
  grep -F -- "- [ ] 真机验证 places map/navigation/share。" "${PLAN}"
  grep -F -- "- [ ] Admin hosting 与 API domain 联调。" "${PLAN}"
  grep -F -- "- [x] 输出 6.24 联调入口、账号、环境、数据清单。" "${PLAN}"
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

echo "Task 4.2 handoff and plan assertions passed." > "${SCRIPT_DIR}/outputs/summary.txt"
cat "${SCRIPT_DIR}/outputs/summary.txt"
