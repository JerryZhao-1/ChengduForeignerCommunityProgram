#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"

mkdir -p "$LOG_DIR"
cd "$ROOT_DIR"

openspec validate add-places-list-v1-and-query-enhancements --strict --no-interactive \
  2>&1 | tee "$LOG_DIR/openspec-validate.log"

