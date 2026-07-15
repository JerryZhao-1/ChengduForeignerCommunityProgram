#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
REPO_DIR="$(cd ../../.. && pwd)"
cd "$REPO_DIR"
echo "Starting mock-mode H5 at http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome"
exec pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174

