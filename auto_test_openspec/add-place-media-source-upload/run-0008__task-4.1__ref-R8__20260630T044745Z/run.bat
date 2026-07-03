@echo off
setlocal
set DIR=%~dp0
pushd "%DIR%\..\..\.." || exit /b 1
if not exist "%DIR%\logs" mkdir "%DIR%\logs"
start "community-map-api" cmd /k "pnpm --filter @community-map/api dev"
start "community-map-mobile" cmd /k "set VITE_API_MODE=http&& set VITE_API_BASE_URL=http://127.0.0.1:8787&& pnpm --filter @community-map/mobile dev:h5"
echo Mobile URL: http://127.0.0.1:5174/#/pages/places/index
echo GUI runbook: %DIR%\tests\gui_runbook_mobile_external_media_detail.md
popd
