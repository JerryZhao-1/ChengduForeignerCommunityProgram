#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="../../.."
mkdir -p logs
cd "$REPO_ROOT"
{
  grep -q "events public list/detail" docs/plan.md
  grep -q "discover public feed/detail" docs/plan.md
  grep -q "files 覆盖 public upload" docs/plan.md
  grep -q "auth/role/notifications" docs/plan.md
  grep -q "targeted Vitest 24 tests passed" docs/plan.md
  grep -q "Non-Places Handler Readiness" docs/cloudbase-dev-api-deployment.md
  grep -q "do not prove CloudBase live collection persistence" docs/cloudbase-dev-api-deployment.md
  grep -q "fallback parity" docs/API接口使用手册.md
  grep -q "handler fallback parity" docs/已实现API接口清单.md
} | tee "auto_test_openspec/complete-events-discover-files-integration-readiness/run-0009__task-5.2__ref-R9__20260623T161802Z/logs/docs-grep.log"
