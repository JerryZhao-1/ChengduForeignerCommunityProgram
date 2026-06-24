@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
if not exist "%SCRIPT_DIR%tests" mkdir "%SCRIPT_DIR%tests"

echo GUI scope: no browser or device automation is executed by this script.
echo Use MCP/approved device evidence collection with: %SCRIPT_DIR%tests\gui_runbook_real_device_places.md
echo Existing blocker record: %SCRIPT_DIR%logs\blocker.md
