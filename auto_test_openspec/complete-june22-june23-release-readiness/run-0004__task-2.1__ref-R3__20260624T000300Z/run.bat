@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

(
  echo Command: VITE_API_MODE=cloudbase-function VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api pnpm --filter @community-map/mobile build:mp-weixin
  set VITE_API_MODE=cloudbase-function
  set VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0
  set VITE_CLOUDBASE_FUNCTION_NAME=community-map-api
  call pnpm --filter @community-map/mobile build:mp-weixin
) > "%SCRIPT_DIR%logs\build.log" 2>&1
if errorlevel 1 exit /b 1

set "OUTPUT_DIR=%REPO_ROOT%\apps\mobile\dist\build\mp-weixin"
if not exist "%OUTPUT_DIR%" exit /b 1
if not exist "%OUTPUT_DIR%\app.js" exit /b 1
if not exist "%OUTPUT_DIR%\app.json" exit /b 1

echo %OUTPUT_DIR%> "%SCRIPT_DIR%outputs\import-path.txt"
dir /b /s "%OUTPUT_DIR%" > "%SCRIPT_DIR%outputs\generated-files.txt"

echo Mini Program build complete. Import path: %OUTPUT_DIR%
