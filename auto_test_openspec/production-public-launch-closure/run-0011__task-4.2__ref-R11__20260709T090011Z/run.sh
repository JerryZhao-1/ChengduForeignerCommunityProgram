#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
PUBLIC_LAUNCH_OUTPUT_DIR="$SCRIPT_DIR/outputs" node scripts/public_launch_verify.mjs true-device-runbook >"$SCRIPT_DIR/logs/run.log" 2>&1

cat <<INFO
GUI-only true-device validation bundle prepared.
This script validates the runbook only; device execution is human-owned.

Runbook:
  $SCRIPT_DIR/tests/gui_runbook_true_device_public_launch.md
INFO
