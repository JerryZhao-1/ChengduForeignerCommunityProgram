#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"

mkdir -p "${SCRIPT_DIR}/logs" "${SCRIPT_DIR}/outputs"

DOC="docs/release-readiness-handoff-2026-06-24.md"

{
  echo "Checking frozen integration configuration..."
  grep -F "cloud1-d7gxdk8t43bd639c0" "${DOC}"
  grep -F "community-map-api" "${DOC}"
  grep -F "https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api" "${DOC}"
  grep -F "https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/" "${DOC}"
  grep -F "wx7518a3c1fcdd39a5" "${DOC}"
  grep -F "public/places/{place_id}/" "${DOC}"
  echo
  echo "Checking data classification..."
  grep -F "19 dev records" "${DOC}"
  grep -F "place_0dc2aece-6aa6-46c5-8971-57646636a22a" "${DOC}"
  grep -F "place_d6af35be-acea-41b8-92ed-cfd0fa909072" "${DOC}"
  grep -F "gallery_file_ids: []" "${DOC}"
  grep -F "placeholder out-of-range coordinates" "${DOC}"
  grep -F "No deletion performed" "${DOC}"
  echo
  echo "Checking production exclusions..."
  grep -F "does not claim production readiness" "${DOC}"
  grep -F "No production data was mutated" "${DOC}"
  grep -F "production release cannot" "${DOC}"
} > "${SCRIPT_DIR}/logs/assertions.log" 2>&1

echo "Task 4.1 config/data classification assertions passed." > "${SCRIPT_DIR}/outputs/summary.txt"
cat "${SCRIPT_DIR}/outputs/summary.txt"
