@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

(
  echo Checking ESLint generated-output ignore...
  findstr /C:"\"**/.cloudbase/**\"" eslint.config.mjs
  echo.
  echo Checking generated-output documentation...
  findstr /C:"Generated deployment output under `apps/api/.cloudbase/` is excluded from source lint" docs\cloudbase-dev-api-deployment.md
) > "%SCRIPT_DIR%logs\assertions.log" 2>&1
if errorlevel 1 exit /b 1

(
  echo Command: pnpm lint
  call pnpm lint
) > "%SCRIPT_DIR%logs\lint.log" 2>&1
if errorlevel 1 exit /b 1

echo Task 1.1 validation complete. Logs: %SCRIPT_DIR%logs
