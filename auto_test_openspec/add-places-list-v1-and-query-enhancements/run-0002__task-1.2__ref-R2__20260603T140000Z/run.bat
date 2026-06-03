@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "ROOT_DIR=%%~fI"
set "LOG_DIR=%SCRIPT_DIR%logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
cd /d "%ROOT_DIR%"

call corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts packages/shared/test/places-marker-contract.spec.ts > "%LOG_DIR%\vitest.log" 2>&1
type "%LOG_DIR%\vitest.log"
exit /b %ERRORLEVEL%

