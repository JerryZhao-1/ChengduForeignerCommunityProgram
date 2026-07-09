@echo off
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
echo Validating production acceptance handoff...
node "%SCRIPT_DIR%tests\test_handoff_structure.mjs" >"%SCRIPT_DIR%logs\handoff-structure.log" 2>&1
if errorlevel 1 exit /b 1
echo Task 6.2 handoff validation completed. Outputs: %SCRIPT_DIR%outputs
