@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "LOG_FILE=%LOG_DIR%\shared-marker-contract.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
pushd "%SCRIPT_DIR%..\..\.."

call pnpm exec vitest run packages/shared/test/places-marker-contract.spec.ts packages/shared/test/contracts.spec.ts > "%LOG_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%LOG_FILE%"

popd
exit /b %EXIT_CODE%
