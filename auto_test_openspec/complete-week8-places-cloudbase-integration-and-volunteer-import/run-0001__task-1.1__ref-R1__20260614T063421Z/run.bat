@echo off
setlocal
set RUN_DIR=%~dp0
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
node scripts/places_volunteer_import.mjs --input docs/志愿者点位采集表.xlsx --output "%~dp0outputs\volunteer-import.json" --dry-run && node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(process.env.RUN_DIR + 'outputs\\volunteer-import.json','utf8')); if(d.parsed.point_count!==19) throw new Error('expected 19 records'); if(!d.parsed.duplicate_labels.some(x=>x.label==='点位类型'&&x.count===2)) throw new Error('missing duplicate category evidence'); if(d.draft_places[0].place.import_review.volunteer_category_raw!=='餐饮') throw new Error('missing volunteer category raw'); console.log('PASS parser assertions');" > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
