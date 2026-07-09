@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%..\..\.." || exit /b 1
set "REPO_ROOT=%CD%"
popd
set "LOG_DIR=%SCRIPT_DIR%logs"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
pushd "%REPO_ROOT%" || exit /b 1

echo Running typecheck...
call corepack pnpm typecheck > "%LOG_DIR%\typecheck.log" 2>&1
if errorlevel 1 exit /b 1
echo typecheck passed

echo Running test...
call corepack pnpm test > "%LOG_DIR%\test.log" 2>&1
if errorlevel 1 exit /b 1
echo test passed

echo Running lint...
call corepack pnpm lint > "%LOG_DIR%\lint.log" 2>&1
if errorlevel 1 exit /b 1
echo lint passed

findstr /C:"filters public posts and creates posts with deterministic visible state" "%LOG_DIR%\test.log" >nul
if not errorlevel 1 (
  echo Known Discover ordering failure still appears in test log. 1>&2
  exit /b 1
)

findstr /C:"enforces public visibility and actor ownership in the shared mock service" "%LOG_DIR%\test.log" >nul
if not errorlevel 1 (
  echo Known shared mock ordering failure still appears in test log. 1>&2
  exit /b 1
)

findstr /C:"_input is assigned a value but never used" "%LOG_DIR%\lint.log" >nul
if not errorlevel 1 (
  echo Known unused _input lint failure still appears in lint log. 1>&2
  exit /b 1
)

echo Task 1.1 quality gate completed. Logs: %LOG_DIR%
popd
