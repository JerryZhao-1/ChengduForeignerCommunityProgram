@echo off
setlocal

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\..
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

if not exist "%SCRIPT_DIR%logs\device-evidence.md" exit /b 1
if not exist "%SCRIPT_DIR%outputs\iphone-14-pro-map-url-error.png" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-urlfix.png" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-urlfix-info.json" exit /b 1

findstr /c:"resolveCloudbaseFunctionPath" apps\mobile\src\api\client.ts >nul || exit /b 1
findstr /c:"resolveCloudbaseFunctionPath" apps\mobile\dist\build\mp-weixin\api\client.js >nul || exit /b 1

(
  echo Task 2.3 remains pending retest.
  echo Initial real-device evidence recorded: app launch, places list, and places map reachable.
  echo Observed blocker: Can't find variable: URL.
  echo Fix build and preview QR recorded under outputs/preview-urlfix.png.
) > "%SCRIPT_DIR%outputs\summary.txt"

type "%SCRIPT_DIR%outputs\summary.txt"
endlocal

