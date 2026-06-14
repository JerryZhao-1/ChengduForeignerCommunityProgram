@echo off
setlocal
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
pnpm --filter @community-map/admin typecheck > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
