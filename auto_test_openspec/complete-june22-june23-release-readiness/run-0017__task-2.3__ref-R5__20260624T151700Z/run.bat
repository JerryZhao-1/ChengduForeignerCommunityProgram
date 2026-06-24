@echo off
setlocal

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\..
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

if not exist "%SCRIPT_DIR%logs\device-evidence.md" exit /b 1
if not exist "%SCRIPT_DIR%outputs\map-position-button-still-inert.jpg" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-switchtab.png" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-switchtab-info.json" exit /b 1

findstr /c:"PLACE_MAP_FOCUS_STORAGE_KEY" apps\mobile\src\pages\places\navigation.ts >nul || exit /b 1
findstr /c:"uni.switchTab" apps\mobile\src\pages\places\detail.vue >nul || exit /b 1
findstr /c:"consumePendingFocusPlace" apps\mobile\src\pages\places\map.vue >nul || exit /b 1

(
  echo Task 2.3 remains pending switchTab retest.
  echo Root cause recorded: map is a tabBar page and cannot be opened via navigateTo.
  echo New preview QR recorded under outputs\preview-switchtab.png.
) > "%SCRIPT_DIR%outputs\summary.txt"

type "%SCRIPT_DIR%outputs\summary.txt"
endlocal

