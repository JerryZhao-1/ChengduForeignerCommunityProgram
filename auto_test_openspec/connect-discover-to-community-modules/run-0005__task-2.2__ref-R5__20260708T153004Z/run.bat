@echo off
setlocal
cd /d "%~dp0..\..\.."
echo Start Mobile H5, then use tests\gui_runbook_related_sections.md
echo URL: http://localhost:5174
set VITE_API_MODE=mock
pnpm --filter @community-map/mobile dev:h5
