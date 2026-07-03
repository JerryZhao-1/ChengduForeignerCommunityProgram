#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/docs-marker-cover.log"
DOC_FILE="$REPO_ROOT/docs/已实现API接口清单.md"

mkdir -p "$LOG_DIR"

{
  echo "Checking marker documentation in $DOC_FILE"
  grep -F "/places/map-markers" "$DOC_FILE"
  grep -F "cover_url" "$DOC_FILE"
  grep -F "string | null" "$DOC_FILE"
  grep -F "轻量封面预览" "$DOC_FILE"
  grep -F "gallery_media" "$DOC_FILE"
  grep -F "gallery_urls" "$DOC_FILE"
  grep -F "external_gallery_media" "$DOC_FILE"
  grep -F "cover_source" "$DOC_FILE"
  grep -F "navigation" "$DOC_FILE"
  grep -F "简介正文" "$DOC_FILE"
} 2>&1 | tee "$LOG_FILE"
