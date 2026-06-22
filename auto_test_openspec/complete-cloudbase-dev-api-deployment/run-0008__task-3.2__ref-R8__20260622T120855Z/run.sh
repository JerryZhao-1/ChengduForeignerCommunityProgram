#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
{
  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 3.2 ref: R8"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo '+ curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '\''"ok":true'\'''
  curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '"ok":true'
  echo '+ curl -sS -f --max-time 20 '\''https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places?page=1&pageSize=5'\'' | grep -q '\''"success":true'\'''
  curl -sS -f --max-time 20 'https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places?page=1&pageSize=5' | grep -q '"success":true'
  echo '+ curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places/map-markers | grep -q '\''"success":true'\'''
  curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places/map-markers | grep -q '"success":true'
  echo '+ grep -q '\''Detail smoke was not run because there is no published live place'\'' docs/cloudbase-dev-api-deployment.md'
  grep -q 'Detail smoke was not run because there is no published live place' docs/cloudbase-dev-api-deployment.md
  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
