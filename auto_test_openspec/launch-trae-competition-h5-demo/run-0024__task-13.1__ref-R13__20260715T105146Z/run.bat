@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "BUNDLE_DIR=%CD%"
set "REPO_DIR=%BUNDLE_DIR%\..\..\.."
set "RUN_DIR=auto_test_openspec\launch-trae-competition-h5-demo\run-0024__task-13.1__ref-R13__20260715T105146Z"
if not exist logs mkdir logs
if not exist outputs mkdir outputs

cd /d "%REPO_DIR%"
echo === R13 API typecheck ===
call pnpm --filter @community-map/api typecheck
if errorlevel 1 exit /b 1
echo === R13 API focused tests (community-plan, app, cloudbase) ===
call pnpm exec vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts --reporter=json --outputFile="%RUN_DIR%\logs\vitest.json"
if errorlevel 1 exit /b 1
echo === R13 shared engine tests (missing catalog) ===
call pnpm exec vitest run packages/shared/test/community-plan-engine.spec.ts
if errorlevel 1 exit /b 1
echo === R13 eslint on modified test file ===
call pnpm exec eslint apps/api/test/community-plan.spec.ts
if errorlevel 1 exit /b 1
echo All R13 CLI assertions completed.
endlocal
