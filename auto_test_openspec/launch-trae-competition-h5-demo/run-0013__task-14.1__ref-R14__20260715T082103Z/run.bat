@echo off
setlocal
pushd "%~dp0"
pushd "..\..\.."
echo Starting mock-mode H5 at http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome
pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
set "RESULT=%ERRORLEVEL%"
popd
popd
exit /b %RESULT%

