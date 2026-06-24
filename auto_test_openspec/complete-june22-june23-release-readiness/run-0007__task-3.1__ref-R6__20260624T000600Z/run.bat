@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
if not exist "%SCRIPT_DIR%tests" mkdir "%SCRIPT_DIR%tests"

echo MIXED scope: this script does not perform GUI automation or mutate hosted state.
echo Use MCP/approved GUI tooling with: %SCRIPT_DIR%tests\gui_runbook_admin_hosting_api.md
echo Observed blocker record: %SCRIPT_DIR%logs\observed-http.md
