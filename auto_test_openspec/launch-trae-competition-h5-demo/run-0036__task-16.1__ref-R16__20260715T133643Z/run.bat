@echo off
setlocal

set "BUNDLE_DIR=%~dp0"
for %%I in ("%BUNDLE_DIR%\..\..\..") do set "REPO_DIR=%%~fI"
cd /d "%REPO_DIR%"

echo Starting mock-mode H5 at http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome
set VITE_API_MODE=mock
call pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
