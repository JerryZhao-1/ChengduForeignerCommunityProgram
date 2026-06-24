@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
if not exist "%SCRIPT_DIR%logs\gui-evidence.md" exit /b 1
if not exist "%SCRIPT_DIR%outputs\import-context.txt" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview-info.json" exit /b 1
if not exist "%SCRIPT_DIR%outputs\preview.png" exit /b 1
echo Task 2.2 GUI evidence files exist.
