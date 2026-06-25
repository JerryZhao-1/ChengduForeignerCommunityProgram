@echo off
setlocal

set SCRIPT_DIR=%~dp0

if not exist "%SCRIPT_DIR%outputs\preview-refresh.png" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-refresh-info.json" exit /b 1
if not exist "%SCRIPT_DIR%logs\preview-refresh.md" exit /b 1

echo Preview refresh QR is available at outputs\preview-refresh.png
endlocal

