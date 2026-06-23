@echo off
setlocal
cd /d "%~dp0"
if not exist logs mkdir logs
node ..\tools\live_places_acceptance.mjs baseline > logs\run.log 2>&1
type logs\run.log
exit /b %ERRORLEVEL%
