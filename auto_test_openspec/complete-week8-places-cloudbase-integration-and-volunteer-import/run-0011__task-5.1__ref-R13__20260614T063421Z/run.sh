#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && node -e "const fs=require('fs'); for (const f of ['docs/week8-places-cloudbase-integration.md','docs/已实现API接口清单.md','docs/plan.md']) { const s=fs.readFileSync(f,'utf8'); if(!/Week 8|第 8 周|志愿者|CloudBase/.test(s)) throw new Error(f+' missing Week 8 status'); } console.log('PASS docs assertions');" ) 2>&1 | tee "$RUN_DIR/logs/run.log"
