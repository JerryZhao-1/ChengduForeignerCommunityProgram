@echo off
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
echo Running Events API acceptance smoke...
node "%SCRIPT_DIR%tests\smoke-events-acceptance.mjs" >"%SCRIPT_DIR%logs\events-acceptance.log" 2>&1
if errorlevel 1 exit /b 1
echo Task 4.1 Events acceptance CLI smoke completed.
echo GUI runbook: %SCRIPT_DIR%tests\gui_runbook_events_acceptance.md
echo Outputs: %SCRIPT_DIR%outputs
