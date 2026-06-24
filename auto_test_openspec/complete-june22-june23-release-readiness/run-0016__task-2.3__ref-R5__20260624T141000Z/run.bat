@echo off
setlocal

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\..
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

if not exist "%SCRIPT_DIR%logs\device-evidence.md" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-mapbutton.png" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-mapbutton-info.json" exit /b 1

findstr /c:"openMapPosition" apps\mobile\src\pages\places\detail.vue >nul || exit /b 1
findstr /c:"placesPagePaths.map" apps\mobile\dist\build\mp-weixin\pages\places\detail.js >nul || exit /b 1

(
  echo Task 2.3 remains pending map-position retest.
  echo Share limitation recorded as accepted platform limitation: Mini Program is not certified.
  echo New preview QR recorded under outputs\preview-mapbutton.png.
) > "%SCRIPT_DIR%outputs\summary.txt"

type "%SCRIPT_DIR%outputs\summary.txt"
endlocal

