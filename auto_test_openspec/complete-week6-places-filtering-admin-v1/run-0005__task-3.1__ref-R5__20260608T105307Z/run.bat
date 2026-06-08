@echo off
setlocal
set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
echo Starting local service for MCP GUI validation.
echo URL: http://127.0.0.1:5174/
echo Log: %SCRIPT_DIR%logs\dev-server.log
corepack pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174 > "%SCRIPT_DIR%logs\dev-server.log" 2>&1
popd
