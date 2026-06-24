@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
break > "%SCRIPT_DIR%outputs\summary.txt"
set OVERALL=0

echo Command: pnpm typecheck > "%SCRIPT_DIR%logs\typecheck.log"
call pnpm typecheck >> "%SCRIPT_DIR%logs\typecheck.log" 2>&1
echo typecheck: exit %ERRORLEVEL% >> "%SCRIPT_DIR%outputs\summary.txt"
if errorlevel 1 set OVERALL=1

echo Command: pnpm test > "%SCRIPT_DIR%logs\test.log"
call pnpm test >> "%SCRIPT_DIR%logs\test.log" 2>&1
echo test: exit %ERRORLEVEL% >> "%SCRIPT_DIR%outputs\summary.txt"
if errorlevel 1 set OVERALL=1

echo Command: pnpm lint > "%SCRIPT_DIR%logs\lint.log"
call pnpm lint >> "%SCRIPT_DIR%logs\lint.log" 2>&1
echo lint: exit %ERRORLEVEL% >> "%SCRIPT_DIR%outputs\summary.txt"
if errorlevel 1 set OVERALL=1

echo Logs: %SCRIPT_DIR%logs >> "%SCRIPT_DIR%outputs\summary.txt"
type "%SCRIPT_DIR%outputs\summary.txt"
exit /b %OVERALL%
