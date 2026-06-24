@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
if not exist "%SCRIPT_DIR%tests" mkdir "%SCRIPT_DIR%tests"

echo GUI scope: no browser automation is executed by this script.
echo Use MCP/approved GUI tooling with: %SCRIPT_DIR%tests\gui_runbook_wechat_devtools_import.md
echo Import path: /Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin
echo Existing blocker record: %SCRIPT_DIR%logs\blocker.md
