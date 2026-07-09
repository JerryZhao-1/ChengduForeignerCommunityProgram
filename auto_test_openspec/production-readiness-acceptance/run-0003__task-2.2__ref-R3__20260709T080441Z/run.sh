#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"

mkdir -p "$LOG_DIR" "$SCRIPT_DIR/outputs"
cd "$REPO_ROOT"

echo "Running identity classification checks..."
node "$SCRIPT_DIR/tests/test_cli_identity_classification.mjs" >"$LOG_DIR/identity-classification.log" 2>&1

echo "Task 2.2 identity classification checks completed. Outputs: $SCRIPT_DIR/outputs"
