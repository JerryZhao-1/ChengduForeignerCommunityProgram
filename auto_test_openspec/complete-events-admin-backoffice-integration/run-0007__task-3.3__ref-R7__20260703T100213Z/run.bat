@echo off
cd /d "%~dp0"
if not exist logs mkdir logs
if not exist outputs\screenshots mkdir outputs\screenshots
set REPO_ROOT=%cd%\..\..\..
echo API: http://127.0.0.1:8787> logs\server.log
echo Admin: http://127.0.0.1:5173/events>> logs\server.log
echo Mobile H5: http://127.0.0.1:5174/#/pages/events/index>> logs\server.log
pushd "%REPO_ROOT%"
start "api" cmd /c "set NODE_OPTIONS=--no-experimental-require-module&& corepack pnpm --filter @community-map/api exec tsx src/dev.ts"
start "admin" cmd /c "set VITE_API_MODE=http&& set VITE_API_BASE_URL=http://127.0.0.1:8787&& corepack pnpm --filter @community-map/admin exec vite --host 127.0.0.1 --port 5173"
start "mobile" cmd /c "set VITE_API_MODE=http&& set VITE_API_BASE_URL=http://127.0.0.1:8787&& corepack pnpm --filter @community-map/mobile exec uni --host 127.0.0.1 --port 5174"
popd
type logs\server.log
