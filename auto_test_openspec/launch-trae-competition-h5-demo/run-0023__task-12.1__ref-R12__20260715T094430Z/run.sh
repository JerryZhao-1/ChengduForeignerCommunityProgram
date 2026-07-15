#!/usr/bin/env bash
# R12 curated catalog and matcher exhaustive review (macOS/Linux).
# Resolves the repository from this script's location, runs the verifier,
# and writes logs/run.log, outputs/result.json, outputs/coverage-summary.json.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"
node "${SCRIPT_DIR}/tests/verify-vitest.mjs"
