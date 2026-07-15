@echo off
setlocal enabledelayedexpansion
set "BUNDLE_DIR=%~dp0"
cd /d "%BUNDLE_DIR%"
set "REPO_DIR=%BUNDLE_DIR%..\..\.."
if not exist logs mkdir logs

call cd /d "%REPO_DIR%"
call pnpm --filter @community-map/shared typecheck 2>&1 | tee "%BUNDLE_DIR%logs\run.log"
if errorlevel 1 exit /b 1
call pnpm exec vitest run packages\shared\test\community-plans.spec.ts packages\shared\test\community-plan-engine.spec.ts packages\shared\test\client.spec.ts 2>&1 | tee -a "%BUNDLE_DIR%logs\run.log"
if errorlevel 1 exit /b 1
echo All R11 CLI assertions completed. 2>&1 | tee -a "%BUNDLE_DIR%logs\run.log"
exit /b 0
