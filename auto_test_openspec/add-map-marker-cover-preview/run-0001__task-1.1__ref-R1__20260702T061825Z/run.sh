#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/shared-marker-contract.log"

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

pnpm exec vitest run \
  packages/shared/test/places-marker-contract.spec.ts \
  packages/shared/test/contracts.spec.ts 2>&1 | tee "$LOG_FILE"
