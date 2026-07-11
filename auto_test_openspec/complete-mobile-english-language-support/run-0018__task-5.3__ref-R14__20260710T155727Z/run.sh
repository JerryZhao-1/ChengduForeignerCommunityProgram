#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
BUILD_PATH="$REPO_ROOT/apps/mobile/dist/build/mp-weixin"
echo "mp-weixin build path: $BUILD_PATH"
echo "app id: wx7518a3c1fcdd39a5"
echo "CloudBase env: cloud1-d7gxdk8t43bd639c0"
echo "CloudBase function: community-map-api"
if [ -f "$BUILD_PATH/app.json" ]; then
  echo "build output present"
else
  echo "build output missing"
  exit 1
fi
echo "This locator does not open, preview, upload, seed, or mutate WeChat/CloudBase state."
