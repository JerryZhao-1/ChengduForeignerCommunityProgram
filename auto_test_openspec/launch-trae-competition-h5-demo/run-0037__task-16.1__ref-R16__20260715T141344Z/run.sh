#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."
VITE_API_MODE=mock pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
