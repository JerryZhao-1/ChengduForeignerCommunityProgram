@echo off
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
echo Running focused Discover interaction tests...
call .\node_modules\.bin\vitest run apps/api/test/cloudbase.spec.ts >"%SCRIPT_DIR%logs\vitest-cloudbase.log" 2>&1
if errorlevel 1 exit /b 1
echo Running CloudBase near-concurrent Discover interaction smoke...
node "%SCRIPT_DIR%tests\smoke-discover-interactions.mjs" >"%SCRIPT_DIR%logs\cloudbase-interactions.log" 2>&1
if errorlevel 1 exit /b 1
echo Task 5.2 Discover interaction hardening checks completed. Outputs: %SCRIPT_DIR%outputs
