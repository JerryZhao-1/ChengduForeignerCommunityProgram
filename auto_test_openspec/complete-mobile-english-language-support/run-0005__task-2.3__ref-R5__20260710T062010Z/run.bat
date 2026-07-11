@echo off
setlocal
pushd "%~dp0"
for %%I in ("%CD%\..\..\..") do set "REPO_ROOT=%%~fI"
pushd "%REPO_ROOT%"
echo API URL: http://127.0.0.1:8787
echo Admin URL: http://localhost:5173
start "community-map-api" cmd /c pnpm dev:api
set VITE_API_MODE=http
set VITE_API_BASE_URL=http://127.0.0.1:8787
call pnpm --filter @community-map/admin dev
popd
popd
