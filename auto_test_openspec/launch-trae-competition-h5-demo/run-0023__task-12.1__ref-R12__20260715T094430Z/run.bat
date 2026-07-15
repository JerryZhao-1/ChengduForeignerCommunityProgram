@echo off
rem R12 curated catalog and matcher exhaustive review (Windows).
rem Inspected for parity with run.sh; not executed on the macOS validation host.
rem Resolves the repository from this script's location, runs the verifier,
rem and writes logs\run.log, outputs\result.json, outputs\coverage-summary.json.
setlocal enableextensions
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%\..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"
node "%SCRIPT_DIR%\tests\verify-vitest.mjs"
exit /b %errorlevel%
