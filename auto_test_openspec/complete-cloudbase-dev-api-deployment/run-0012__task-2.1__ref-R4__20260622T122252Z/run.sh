#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RUN_PORT="${RUN_PORT:-9021}"

mkdir -p "$SCRIPT_DIR/logs"

main() {
  local tmp_dir
  local server_pid=""

  tmp_dir="$(mktemp -d /tmp/community-map-function.XXXXXX)"

  stop_server() {
    if [[ -n "$server_pid" ]]; then
      kill "$server_pid" >/dev/null 2>&1 || true
      for _ in {1..20}; do
        if ! kill -0 "$server_pid" >/dev/null 2>&1; then
          break
        fi
        sleep 0.1
      done
      kill -9 "$server_pid" >/dev/null 2>&1 || true
      wait "$server_pid" 2>/dev/null || true
      server_pid=""
    fi
  }

  cleanup() {
    stop_server >/dev/null 2>&1
    rm -rf "$tmp_dir"
  }
  trap cleanup EXIT

  cd "$REPO_ROOT"

  echo "change-id: complete-cloudbase-dev-api-deployment"
  echo "task: 2.1 ref: R4"
  echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  echo "+ pnpm --filter @community-map/api build:cloudbase-http"
  pnpm --filter @community-map/api build:cloudbase-http

  echo "+ test -f apps/api/.cloudbase/community-map-api/index.cjs"
  test -f apps/api/.cloudbase/community-map-api/index.cjs

  echo "+ test -x apps/api/.cloudbase/community-map-api/scf_bootstrap"
  test -x apps/api/.cloudbase/community-map-api/scf_bootstrap

  echo "+ grep -q '/var/lang/node18/bin/node index.cjs' apps/api/.cloudbase/community-map-api/scf_bootstrap"
  grep -q '/var/lang/node18/bin/node index.cjs' apps/api/.cloudbase/community-map-api/scf_bootstrap

  echo "+ cp generated function folder to isolated temp dir"
  cp -R apps/api/.cloudbase/community-map-api/. "$tmp_dir"

  echo "+ test ! -d isolated node_modules"
  test ! -d "$tmp_dir/node_modules"

  echo "+ PORT=$RUN_PORT node index.cjs"
  (
    cd "$tmp_dir"
    PORT="$RUN_PORT" node index.cjs >server.log 2>&1
  ) &
  server_pid=$!

  sleep 1

  echo "+ curl -sS -f http://127.0.0.1:$RUN_PORT/api/health"
  curl -sS -f -H "Connection: close" "http://127.0.0.1:$RUN_PORT/api/health" | tee "$SCRIPT_DIR/logs/health.json"
  grep -q '{"ok":true}' "$SCRIPT_DIR/logs/health.json"

  echo "+ isolated server log"
  sed -n '1,20p' "$tmp_dir/server.log"

  stop_server >/dev/null 2>&1

  echo "completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

main 2>&1 | tee "$SCRIPT_DIR/logs/run.log"
