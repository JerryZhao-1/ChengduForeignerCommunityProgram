@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "RUN_DIR=%SCRIPT_DIR%.."
set "LOG_DIR=%RUN_DIR%\logs"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
pushd "%RUN_DIR%\..\..\.."

call openspec validate add-map-marker-cover-preview --strict --no-interactive > "%LOG_DIR%\openspec-validate.log" 2>&1
if errorlevel 1 goto fail

call node_modules\.bin\vitest run packages/shared/test/places-marker-contract.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts > "%LOG_DIR%\focused-regression.log" 2>&1
if errorlevel 1 goto fail

call corepack pnpm --filter @community-map/mobile typecheck > "%LOG_DIR%\mobile-typecheck.log" 2>&1
if errorlevel 1 goto fail

type "%LOG_DIR%\openspec-validate.log"
type "%LOG_DIR%\focused-regression.log"
type "%LOG_DIR%\mobile-typecheck.log"
popd
exit /b 0

:fail
type "%LOG_DIR%\openspec-validate.log" 2>nul
type "%LOG_DIR%\focused-regression.log" 2>nul
type "%LOG_DIR%\mobile-typecheck.log" 2>nul
popd
exit /b 1
