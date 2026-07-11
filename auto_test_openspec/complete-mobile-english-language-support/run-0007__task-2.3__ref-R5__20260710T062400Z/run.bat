@echo off
setlocal
pushd "%~dp0"
for %%I in ("%CD%\..\..\..") do set "REPO_ROOT=%%~fI"
pushd "%REPO_ROOT%"
echo API URL: http://127.0.0.1:8787
echo Admin URL: http://localhost:5173 (mock client)
start "community-map-api" cmd /c "set NODE_OPTIONS=--no-experimental-require-module&& pnpm --filter @community-map/api exec tsx src/dev.ts"
call pnpm --filter @community-map/admin dev
popd
popd
