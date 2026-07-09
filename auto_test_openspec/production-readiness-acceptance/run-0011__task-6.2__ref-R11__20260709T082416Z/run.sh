#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"

echo "Validating production acceptance handoff..."
node "$SCRIPT_DIR/tests/test_handoff_structure.mjs" >"$SCRIPT_DIR/logs/handoff-structure.log" 2>&1

echo "Task 6.2 handoff validation completed. Outputs: $SCRIPT_DIR/outputs"
