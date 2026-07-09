@echo off
set SCRIPT_DIR=%~dp0
echo Task 3.1 GUI validation entrypoints
echo.
echo Mini Program project:
echo   %CD%\apps\mobile\dist\build\mp-weixin
echo.
echo API target:
echo   https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api
echo.
echo Runbook:
echo   %SCRIPT_DIR%tests\gui_runbook_places_share.md
echo.
echo Static CLI check:
echo   node %SCRIPT_DIR%tests\test_cli_places_share_static.mjs
echo.
echo Expected GUI outputs:
echo   %SCRIPT_DIR%outputs\places-share-detail-loaded.png
echo   %SCRIPT_DIR%outputs\places-share-native-panel.png
echo   %SCRIPT_DIR%outputs\places-share-console.log
echo   %SCRIPT_DIR%outputs\places-share-result.json
