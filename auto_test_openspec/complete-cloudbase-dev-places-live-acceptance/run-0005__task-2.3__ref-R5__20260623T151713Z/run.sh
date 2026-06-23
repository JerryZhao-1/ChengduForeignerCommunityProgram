#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p logs
node ../tools/live_places_acceptance.mjs draft-denial 2>&1 | tee logs/run.log
