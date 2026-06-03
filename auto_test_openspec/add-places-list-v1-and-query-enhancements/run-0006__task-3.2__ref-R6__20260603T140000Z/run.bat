@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "ROOT_DIR=%%~fI"
set "LOG_DIR=%SCRIPT_DIR%logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
cd /d "%ROOT_DIR%"

call corepack pnpm --filter @community-map/mobile typecheck > "%LOG_DIR%\typecheck.log" 2>&1
type "%LOG_DIR%\typecheck.log"
exit /b %ERRORLEVEL%

