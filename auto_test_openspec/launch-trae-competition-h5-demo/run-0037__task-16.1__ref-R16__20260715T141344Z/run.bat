@echo off
setlocal

cd /d "%~dp0\..\..\.."
set "VITE_API_MODE=mock"
call pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
exit /b %ERRORLEVEL%
