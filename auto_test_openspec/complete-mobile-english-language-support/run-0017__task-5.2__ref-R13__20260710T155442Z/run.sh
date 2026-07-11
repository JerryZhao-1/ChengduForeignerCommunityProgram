#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
echo "H5 URL: http://127.0.0.1:5174"
echo "Optional local API URL: http://127.0.0.1:8787 (H5 fixture run uses mock mode)"
pnpm --filter @community-map/mobile exec uni --force
