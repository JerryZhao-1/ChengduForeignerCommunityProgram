#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
TARGET_FILE="$SCRIPT_DIR/inputs/target.json"

mkdir -p "$LOG_DIR" "$SCRIPT_DIR/outputs"
cd "$REPO_ROOT"

API_BASE_URL="$(node -e 'const fs=require("fs"); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, "utf8")).apiBaseUrl)' "$TARGET_FILE")"
CLOUDBASE_ENV_ID="$(node -e 'const fs=require("fs"); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, "utf8")).cloudbaseEnvId)' "$TARGET_FILE")"
CLOUDBASE_FUNCTION_NAME="$(node -e 'const fs=require("fs"); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, "utf8")).cloudFunctionName)' "$TARGET_FILE")"

echo "Building Mini Program with CloudBase function mode..."
VITE_API_MODE=cloudbase-function \
VITE_API_BASE_URL="$API_BASE_URL" \
VITE_CLOUDBASE_ENV_ID="$CLOUDBASE_ENV_ID" \
VITE_CLOUDBASE_FUNCTION_NAME="$CLOUDBASE_FUNCTION_NAME" \
corepack pnpm --filter @community-map/mobile build:mp-weixin >"$LOG_DIR/build-mp-weixin.log" 2>&1

echo "Running CloudBase API smoke..."
node "$SCRIPT_DIR/tests/smoke-cloudbase-api.mjs" >"$LOG_DIR/smoke.log" 2>&1

echo "Task 2.1 CloudBase API target smoke completed. Outputs: $SCRIPT_DIR/outputs"
