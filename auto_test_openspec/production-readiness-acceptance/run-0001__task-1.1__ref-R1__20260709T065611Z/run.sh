#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

run_and_log() {
  local name="$1"
  shift
  echo "Running $name..."
  "$@" >"$LOG_DIR/$name.log" 2>&1
  echo "$name passed"
}

run_and_log typecheck corepack pnpm typecheck
run_and_log test corepack pnpm test
run_and_log lint corepack pnpm lint

if grep -Fq "filters public posts and creates posts with deterministic visible state" "$LOG_DIR/test.log"; then
  echo "Known Discover ordering failure still appears in test log." >&2
  exit 1
fi

if grep -Fq "enforces public visibility and actor ownership in the shared mock service" "$LOG_DIR/test.log"; then
  echo "Known shared mock ordering failure still appears in test log." >&2
  exit 1
fi

if grep -Fq "_input is assigned a value but never used" "$LOG_DIR/lint.log"; then
  echo "Known unused _input lint failure still appears in lint log." >&2
  exit 1
fi

echo "Task 1.1 quality gate completed. Logs: $LOG_DIR"
