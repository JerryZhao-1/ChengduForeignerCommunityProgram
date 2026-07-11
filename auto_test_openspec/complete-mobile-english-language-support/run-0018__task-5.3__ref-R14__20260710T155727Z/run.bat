@echo off
set SCRIPT_DIR=%~dp0
set BUILD_PATH=%SCRIPT_DIR%..\..\..\apps\mobile\dist\build\mp-weixin
echo mp-weixin build path: %BUILD_PATH%
echo app id: wx7518a3c1fcdd39a5
echo CloudBase env: cloud1-d7gxdk8t43bd639c0
echo CloudBase function: community-map-api
if not exist "%BUILD_PATH%\app.json" exit /b 1
echo build output present
