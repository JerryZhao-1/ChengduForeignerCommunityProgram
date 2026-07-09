@echo off
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
echo Running Discover API acceptance smoke...
node "%SCRIPT_DIR%tests\smoke-discover-acceptance.mjs" >"%SCRIPT_DIR%logs\discover-acceptance.log" 2>&1
if errorlevel 1 exit /b 1
echo Task 5.1 Discover acceptance CLI smoke completed.
echo GUI runbook: %SCRIPT_DIR%tests\gui_runbook_discover_acceptance.md
echo Outputs: %SCRIPT_DIR%outputs
