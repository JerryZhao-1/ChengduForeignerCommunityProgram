@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs\screenshots" mkdir "%SCRIPT_DIR%outputs\screenshots"

echo Starting Mobile H5 for MCP GUI validation > "%SCRIPT_DIR%logs\mobile-h5-server.log"
echo URL: http://localhost:5174/#/pages/discover/detail?id=post_001 >> "%SCRIPT_DIR%logs\mobile-h5-server.log"
set VITE_API_MODE=http
set VITE_API_BASE_URL=http://127.0.0.1:8787
cd apps\mobile
call .\node_modules\.bin\uni >> "%SCRIPT_DIR%logs\mobile-h5-server.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
