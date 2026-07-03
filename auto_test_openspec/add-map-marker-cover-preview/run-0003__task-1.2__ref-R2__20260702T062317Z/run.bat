@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "LOG_FILE=%LOG_DIR%\provider-marker-cover.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
pushd "%SCRIPT_DIR%..\..\.."

call node_modules\.bin\vitest run packages/shared/test/places-marker-contract.spec.ts packages/shared/test/client.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts > "%LOG_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%LOG_FILE%"

popd
exit /b %EXIT_CODE%
