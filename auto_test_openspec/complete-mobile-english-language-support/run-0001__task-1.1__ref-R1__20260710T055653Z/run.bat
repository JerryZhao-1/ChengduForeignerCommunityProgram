@echo off
setlocal
pushd "%~dp0"
set "SCRIPT_DIR=%CD%"
for %%I in ("%SCRIPT_DIR%\..\..\..") do set "REPO_ROOT=%%~fI"
if not exist logs mkdir logs
if not exist outputs mkdir outputs
pushd "%REPO_ROOT%"

call node_modules\.bin\vitest.cmd run apps/mobile/src/i18n/catalog.spec.ts apps/mobile/src/pages/events/event-signup-state.spec.ts >"%SCRIPT_DIR%\logs\focused-tests.log" 2>&1
set TEST_EXIT=%ERRORLEVEL%

call pnpm --filter @community-map/mobile typecheck >"%SCRIPT_DIR%\logs\mobile-typecheck.log" 2>&1
set TYPECHECK_EXIT=%ERRORLEVEL%

findstr /R /N "[一-鿿]" apps\mobile\src\pages\events\event-signup-state.ts >"%SCRIPT_DIR%\logs\domain-copy-scan.log" 2>&1
if %ERRORLEVEL% EQU 0 (set SCAN_EXIT=1) else (set SCAN_EXIT=0)

node "%SCRIPT_DIR%\tests\summarize.mjs" %TEST_EXIT% %TYPECHECK_EXIT% %SCAN_EXIT% "%SCRIPT_DIR%\outputs\result.json"
popd
if not %TEST_EXIT% EQU 0 exit /b 1
if not %TYPECHECK_EXIT% EQU 0 exit /b 1
if not %SCAN_EXIT% EQU 0 exit /b 1
popd
exit /b 0
