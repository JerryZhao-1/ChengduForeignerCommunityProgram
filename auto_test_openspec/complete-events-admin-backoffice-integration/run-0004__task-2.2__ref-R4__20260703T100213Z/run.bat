@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set REPO_ROOT=%cd%\..\..\..
if not exist logs mkdir logs
pushd "%REPO_ROOT%"
corepack pnpm exec vitest run apps/api/test/integration-readiness.spec.ts packages/shared/test/integration-readiness.spec.ts > "%~dp0logs\run.log" 2>&1
if errorlevel 1 exit /b 1
popd
type "%~dp0logs\run.log"
