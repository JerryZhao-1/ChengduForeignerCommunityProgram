@echo off
setlocal
pushd "%~dp0"
for %%I in ("%CD%\..\..\..") do set "REPO_ROOT=%%~fI"
pushd "%REPO_ROOT%"
echo H5 URL: http://127.0.0.1:5174
call pnpm --filter @community-map/mobile exec uni --force
popd
popd
