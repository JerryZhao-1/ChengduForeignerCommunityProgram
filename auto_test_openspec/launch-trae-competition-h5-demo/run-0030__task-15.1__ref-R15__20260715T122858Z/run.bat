@echo off
setlocal enableextensions
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for /f "delims=" %%I in ("%SCRIPT_DIR%\..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"
node "%SCRIPT_DIR%\tests\verify-vitest.mjs"
exit /b %ERRORLEVEL%
