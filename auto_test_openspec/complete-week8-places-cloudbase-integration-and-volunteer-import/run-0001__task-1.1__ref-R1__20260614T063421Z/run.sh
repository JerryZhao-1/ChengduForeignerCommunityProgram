#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RUN_DIR="$(pwd)"
ROOT="$(cd ../../.. && pwd)"
cd "$ROOT"
mkdir -p "$RUN_DIR/logs" "$RUN_DIR/outputs"
( cd "$ROOT" && node scripts/places_volunteer_import.mjs --input docs/志愿者点位采集表.xlsx --output "$RUN_DIR/outputs/volunteer-import.json" --dry-run && node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(process.env.RUN_DIR + '/outputs/volunteer-import.json','utf8')); if(d.parsed.point_count!==19) throw new Error('expected 19 records'); if(!d.parsed.duplicate_labels.some(x=>x.label==='点位类型'&&x.count===2)) throw new Error('missing duplicate category evidence'); if(d.draft_places[0].place.import_review.volunteer_category_raw!=='餐饮') throw new Error('missing volunteer category raw'); console.log('PASS parser assertions');" ) 2>&1 | tee "$RUN_DIR/logs/run.log"
