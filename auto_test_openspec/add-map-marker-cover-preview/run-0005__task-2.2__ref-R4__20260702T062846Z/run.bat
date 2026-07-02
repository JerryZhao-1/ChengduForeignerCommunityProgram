@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "API_LOG=%LOG_DIR%\api-dev.log"
set "MOBILE_LOG=%LOG_DIR%\mobile-h5-dev.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
pushd "%SCRIPT_DIR%..\..\.."

echo API URL: http://127.0.0.1:8787
echo Mobile H5 URL: http://127.0.0.1:5174/#/pages/places/map

start "community-map-api-r4" /b cmd /c corepack pnpm --filter @community-map/api dev ^> "%API_LOG%" 2^>^&1
set "VITE_API_MODE=http"
set "VITE_API_BASE_URL=http://127.0.0.1:8787"
call corepack pnpm --filter @community-map/mobile dev:h5 > "%MOBILE_LOG%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"

popd
exit /b %EXIT_CODE%
