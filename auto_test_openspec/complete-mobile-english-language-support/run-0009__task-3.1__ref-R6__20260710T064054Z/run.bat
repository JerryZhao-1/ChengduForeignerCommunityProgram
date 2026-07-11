@echo off
setlocal
pushd "%~dp0"
for %%I in ("%CD%\..\..\..") do set "REPO_ROOT=%%~fI"
pushd "%REPO_ROOT%"
echo H5 URL: http://localhost:5174
echo API URL: http://127.0.0.1:8787
start "community-map-api" cmd /c "set NODE_OPTIONS=--no-experimental-require-module&& pnpm --filter @community-map/api exec tsx src/dev.ts"
call pnpm --filter @community-map/mobile dev:h5 -- --force
popd
popd
