@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs\screenshots" mkdir "%SCRIPT_DIR%outputs\screenshots"

echo Starting Admin for MCP content ops validation > "%SCRIPT_DIR%logs\admin-server.log"
echo URL: http://localhost:5173/posts >> "%SCRIPT_DIR%logs\admin-server.log"
set VITE_API_MODE=http
set VITE_API_BASE_URL=http://127.0.0.1:8787
cd apps\admin
call .\node_modules\.bin\vite --host 127.0.0.1 >> "%SCRIPT_DIR%logs\admin-server.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
