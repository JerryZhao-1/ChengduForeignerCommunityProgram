@echo off
setlocal
pushd "%~dp0"
set "SCRIPT_DIR=%CD%"
for %%I in ("%SCRIPT_DIR%\..\..\..") do set "REPO_ROOT=%%~fI"
if not exist logs mkdir logs
if not exist outputs mkdir outputs
pushd "%REPO_ROOT%"
call node_modules\.bin\vitest.cmd run apps/api/test/bilingual-preferences.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts packages/shared/test/bilingual-contracts.spec.ts >"%SCRIPT_DIR%\logs\focused-provider-tests.log" 2>&1
set TEST_EXIT=%ERRORLEVEL%
call pnpm --filter @community-map/api typecheck >"%SCRIPT_DIR%\logs\api-typecheck.log" 2>&1
set API_EXIT=%ERRORLEVEL%
call pnpm --filter @community-map/shared typecheck >"%SCRIPT_DIR%\logs\shared-typecheck.log" 2>&1
set SHARED_EXIT=%ERRORLEVEL%
node "%SCRIPT_DIR%\tests\summarize.mjs" %TEST_EXIT% %API_EXIT% %SHARED_EXIT% "%SCRIPT_DIR%\outputs\result.json"
popd
if not %TEST_EXIT% EQU 0 exit /b 1
if not %API_EXIT% EQU 0 exit /b 1
if not %SHARED_EXIT% EQU 0 exit /b 1
popd
exit /b 0
