#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && node scripts/places_volunteer_import.mjs --input docs/志愿者点位采集表.xlsx --output "$RUN_DIR/outputs/volunteer-import.json" --dry-run && node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(process.env.RUN_DIR + '/outputs/volunteer-import.json','utf8')); if(d.summary.draft_count!==19||d.summary.public_count!==0) throw new Error('draft/public count mismatch'); if(d.summary.records_needing_coordinate_review!==19) throw new Error('coordinate blocker mismatch'); if(!d.draft_places.every(x=>x.place.status==='draft'&&x.place.import_review)) throw new Error('non draft import found'); console.log('PASS mapper assertions');" ) 2>&1 | tee "$RUN_DIR/logs/run.log"
