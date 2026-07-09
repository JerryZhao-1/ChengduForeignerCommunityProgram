@echo off
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
echo Running production-preview config/media scan...
node "%SCRIPT_DIR%tests\test_cli_config_media.mjs" >"%SCRIPT_DIR%logs\config-media-scan.log" 2>&1
if errorlevel 1 exit /b 1
echo Task 6.1 config/media scan completed.
echo GUI runbook: %SCRIPT_DIR%tests\gui_runbook_config_media.md
echo Outputs: %SCRIPT_DIR%outputs
