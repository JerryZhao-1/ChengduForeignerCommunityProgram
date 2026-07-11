@echo off
set BUILD=%~dp0..\..\..\apps\mobile\dist\build\mp-weixin
if not exist "%BUILD%\app.json" exit /b 1
echo mp-weixin build: %BUILD%
echo This locator does not drive WeChat or mutate production data.
