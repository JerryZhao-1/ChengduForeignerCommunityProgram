@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
if not exist logs mkdir logs
if not exist outputs\screenshots mkdir outputs\screenshots
set REPO_ROOT=%cd%\..\..\..
pushd "%REPO_ROOT%"
openspec validate complete-events-admin-backoffice-integration --strict --no-interactive > "%~dp0logs\final-cli.log" 2>&1
if errorlevel 1 exit /b 1
corepack pnpm test >> "%~dp0logs\final-cli.log" 2>&1
if errorlevel 1 exit /b 1
corepack pnpm lint >> "%~dp0logs\final-cli.log" 2>&1
if errorlevel 1 exit /b 1
corepack pnpm typecheck >> "%~dp0logs\final-cli.log" 2>&1
if errorlevel 1 exit /b 1
start "api" cmd /c "set NODE_OPTIONS=--no-experimental-require-module&& corepack pnpm --filter @community-map/api exec tsx src/dev.ts"
start "admin" cmd /c "set VITE_API_MODE=http&& set VITE_API_BASE_URL=http://127.0.0.1:8787&& corepack pnpm --filter @community-map/admin exec vite --host 127.0.0.1 --port 5173"
start "mobile" cmd /c "set VITE_API_MODE=http&& set VITE_API_BASE_URL=http://127.0.0.1:8787&& corepack pnpm --filter @community-map/mobile exec uni --host 127.0.0.1 --port 5174"
popd
type logs\final-cli.log
