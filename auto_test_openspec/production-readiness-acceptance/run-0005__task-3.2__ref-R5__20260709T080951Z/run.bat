@echo off
set SCRIPT_DIR=%~dp0
echo Task 3.2 GUI validation entrypoints
echo.
echo Mini Program project:
echo   %CD%\apps\mobile\dist\build\mp-weixin
echo.
echo API target:
echo   https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api
echo.
echo Runbook:
echo   %SCRIPT_DIR%tests\gui_runbook_places_navigation.md
echo.
echo Static CLI check:
echo   node %SCRIPT_DIR%tests\test_cli_places_navigation_static.mjs
echo.
echo Expected GUI outputs are listed in the runbook.
