#!/usr/bin/env bash
set -euo pipefail

RUN_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$RUN_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

test "$(shasum -a 256 "$RUN_DIR/outputs/admin-after-root.html" | cut -d " " -f 1)" = "098244bcd9220b4b223b8d043468f254847c8304aa35c57d47fb58fc68eb3a5e"
test "$(shasum -a 256 "$RUN_DIR/outputs/admin-after-places.html" | cut -d " " -f 1)" = "098244bcd9220b4b223b8d043468f254847c8304aa35c57d47fb58fc68eb3a5e"
test "$(awk 'NR == 1 { print $1 }' "$RUN_DIR/logs/static-assets.tsv")" = "200"

R18_API_RESPONSE="$RUN_DIR/outputs/api-online-profile.json" R18_FINGERPRINT_OUTPUT="$RUN_DIR/outputs/semantic-fingerprint.json" pnpm exec vitest run --config "$RUN_DIR/vitest.config.ts"

echo "Captured evidence checks passed."
echo "R18 remains NOT COMPLETE: read logs/supervisor-verdict.md."
