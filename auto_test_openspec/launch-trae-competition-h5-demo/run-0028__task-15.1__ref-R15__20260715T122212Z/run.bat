@echo off
REM R15 Community Plan adapter, mock mode, and offline bundle parity review (Windows).
REM Resolves the repository from this script's location and invokes the verifier.
setlocal enableextensions
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for /f "delims=" %%I in ("%SCRIPT_DIR%\..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"
node "%SCRIPT_DIR%\tests\verify-vitest.mjs"
exit /b %ERRORLEVEL%
