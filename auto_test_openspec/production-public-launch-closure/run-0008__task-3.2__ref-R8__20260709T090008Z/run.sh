#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
PUBLIC_LAUNCH_OUTPUT_DIR="$SCRIPT_DIR/outputs" node scripts/public_launch_verify.mjs cloudbase-readiness >"$SCRIPT_DIR/logs/run.log" 2>&1
cat "$SCRIPT_DIR/logs/run.log"
