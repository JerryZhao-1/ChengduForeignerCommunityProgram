@echo off
setlocal
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
pnpm test -- apps/api/test/cloudbase.spec.ts apps/api/test/app.spec.ts > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
