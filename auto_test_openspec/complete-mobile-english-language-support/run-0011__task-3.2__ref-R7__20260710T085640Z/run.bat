@echo off
setlocal
pushd "%~dp0"
for %%I in ("%CD%\..\..\..") do set "REPO_ROOT=%%~fI"
pushd "%REPO_ROOT%"
echo H5 URL: http://127.0.0.1:5174
echo Admin URL: http://127.0.0.1:5173/events
start "community-map-mobile" cmd /c "pnpm --filter @community-map/mobile exec uni --force"
call pnpm --filter @community-map/admin exec vite --host 127.0.0.1
popd
popd
