@echo off
setlocal
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
node -e "const fs=require('fs'); for (const f of ['docs/week8-places-cloudbase-integration.md','docs/已实现API接口清单.md','docs/plan.md']) { const s=fs.readFileSync(f,'utf8'); if(!/Week 8|第 8 周|志愿者|CloudBase/.test(s)) throw new Error(f+' missing Week 8 status'); } console.log('PASS docs assertions');" > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
