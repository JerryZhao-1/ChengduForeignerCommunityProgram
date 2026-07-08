#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT/apps/admin"
echo "Admin URL: http://127.0.0.1:5173/"
exec ../../node_modules/.bin/vite --host 127.0.0.1 --port 5173
