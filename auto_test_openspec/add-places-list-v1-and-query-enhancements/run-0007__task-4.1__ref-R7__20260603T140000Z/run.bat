@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "ROOT_DIR=%%~fI"
set "LOG_DIR=%SCRIPT_DIR%logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
cd /d "%ROOT_DIR%"

call openspec validate add-places-list-v1-and-query-enhancements --strict --no-interactive > "%LOG_DIR%\openspec-validate.log" 2>&1
type "%LOG_DIR%\openspec-validate.log"
exit /b %ERRORLEVEL%

