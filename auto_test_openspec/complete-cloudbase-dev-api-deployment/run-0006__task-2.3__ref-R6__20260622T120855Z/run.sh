#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 2.3 ref: R6"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ grep -q '\''| `GET /health` | 200 |'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q '| `GET /health` | 200 |' docs/cloudbase-dev-api-deployment.md
  echo '+ grep -q '\''bc257000-fcda-4822-a4e4-8f1c323ce523'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'bc257000-fcda-4822-a4e4-8f1c323ce523' docs/cloudbase-dev-api-deployment.md
  echo '+ curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '\''"ok":true'\'''
  curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '"ok":true'
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
