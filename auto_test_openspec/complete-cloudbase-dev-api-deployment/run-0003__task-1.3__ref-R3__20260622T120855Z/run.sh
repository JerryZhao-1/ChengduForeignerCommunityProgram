#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 1.3 ref: R3"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''CloudBase dev API 部署闭环已完成'\'' docs/plan.md'
  grep -q 'CloudBase dev API 部署闭环已完成' docs/plan.md
  echo '+ grep -q '\''2026-06-22 Dev API Update'\'' docs/cloudbase-week4-deployment-baseline.md'
  grep -q '2026-06-22 Dev API Update' docs/cloudbase-week4-deployment-baseline.md
  echo '+ grep -q '\''CloudBase MCP and dev API status'\'' docs/week8-places-cloudbase-integration.md'
  grep -q 'CloudBase MCP and dev API status' docs/week8-places-cloudbase-integration.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
