@echo off
set SCRIPT_DIR=%~dp0
echo Task 3.3 GUI validation entrypoints
echo.
echo Canonical WeChat DevTools import path:
echo   %CD%\apps\mobile\dist\build\mp-weixin
echo.
echo API target:
echo   https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api
echo.
echo Runbook:
echo   %SCRIPT_DIR%tests\gui_runbook_mini_program_tabs.md
echo.
echo Static CLI check:
echo   node %SCRIPT_DIR%tests\test_cli_mini_program_tabs_static.mjs
echo.
echo Expected GUI outputs are listed in the runbook.
