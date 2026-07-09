@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%..\..\.."

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

echo Running identity classification checks...
node "%SCRIPT_DIR%tests\test_cli_identity_classification.mjs" >"%SCRIPT_DIR%logs\identity-classification.log" 2>&1
if errorlevel 1 exit /b 1

echo Task 2.2 identity classification checks completed. Outputs: %SCRIPT_DIR%outputs
popd
