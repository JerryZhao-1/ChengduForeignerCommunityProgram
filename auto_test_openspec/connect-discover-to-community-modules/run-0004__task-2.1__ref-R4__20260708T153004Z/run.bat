@echo off
setlocal
cd /d "%~dp0..\..\.."
echo Start Mobile H5, then use tests\gui_runbook_discover_create_detail.md
echo URL: http://localhost:5174
set VITE_API_MODE=mock
pnpm --filter @community-map/mobile dev:h5
