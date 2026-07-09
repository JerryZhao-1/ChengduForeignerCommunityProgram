@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%..\..\.." || exit /b 1
set "REPO_ROOT=%CD%"
popd
set "LOG_DIR=%SCRIPT_DIR%logs"
set "TARGET_FILE=%SCRIPT_DIR%inputs\target.json"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
pushd "%REPO_ROOT%" || exit /b 1

for /f "usebackq delims=" %%a in (`node -e "const fs=require('fs'); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, 'utf8')).apiBaseUrl)" "%TARGET_FILE%"`) do set "API_BASE_URL=%%a"
for /f "usebackq delims=" %%a in (`node -e "const fs=require('fs'); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, 'utf8')).cloudbaseEnvId)" "%TARGET_FILE%"`) do set "CLOUDBASE_ENV_ID=%%a"
for /f "usebackq delims=" %%a in (`node -e "const fs=require('fs'); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p, 'utf8')).cloudFunctionName)" "%TARGET_FILE%"`) do set "CLOUDBASE_FUNCTION_NAME=%%a"

echo Building Mini Program with CloudBase function mode...
set VITE_API_MODE=cloudbase-function
set VITE_API_BASE_URL=%API_BASE_URL%
set VITE_CLOUDBASE_ENV_ID=%CLOUDBASE_ENV_ID%
set VITE_CLOUDBASE_FUNCTION_NAME=%CLOUDBASE_FUNCTION_NAME%
call corepack pnpm --filter @community-map/mobile build:mp-weixin > "%LOG_DIR%\build-mp-weixin.log" 2>&1
if errorlevel 1 exit /b 1

echo Running CloudBase API smoke...
node "%SCRIPT_DIR%tests\smoke-cloudbase-api.mjs" > "%LOG_DIR%\smoke.log" 2>&1
if errorlevel 1 exit /b 1

echo Task 2.1 CloudBase API target smoke completed. Outputs: %SCRIPT_DIR%outputs
popd
