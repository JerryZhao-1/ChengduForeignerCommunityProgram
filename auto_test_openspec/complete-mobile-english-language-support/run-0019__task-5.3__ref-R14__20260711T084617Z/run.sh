#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BUILD="$ROOT/apps/mobile/dist/build/mp-weixin"

test -f "$BUILD/app.json"
printf 'mp-weixin build: %s\n' "$BUILD"
printf 'This locator does not drive WeChat DevTools or mutate production data.\n'
