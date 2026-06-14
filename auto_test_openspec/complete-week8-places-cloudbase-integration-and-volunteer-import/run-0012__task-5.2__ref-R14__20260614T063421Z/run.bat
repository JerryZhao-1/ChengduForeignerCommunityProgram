@echo off
setlocal
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
openspec validate complete-week8-places-cloudbase-integration-and-volunteer-import --strict --no-interactive && pnpm typecheck && pnpm test && pnpm lint > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
