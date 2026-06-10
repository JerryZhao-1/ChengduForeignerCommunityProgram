#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
cd ../../..
echo "Starting Mobile H5 for Task 1.2 GUI verification"
echo "URL: http://127.0.0.1:5174/"
pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
