@echo off
setlocal
set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\..
cd /d "%REPO_ROOT%"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
set PUBLIC_LAUNCH_OUTPUT_DIR=%SCRIPT_DIR%outputs

node scripts/public_launch_verify.mjs public-review-config > "%SCRIPT_DIR%logs\run.log" 2>&1
set COMMAND_STATUS=%ERRORLEVEL%
type "%SCRIPT_DIR%logs\run.log"
endlocal & exit /b %COMMAND_STATUS%
