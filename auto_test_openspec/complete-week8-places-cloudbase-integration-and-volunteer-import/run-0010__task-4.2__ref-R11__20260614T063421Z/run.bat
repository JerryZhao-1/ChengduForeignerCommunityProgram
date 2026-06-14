@echo off
setlocal
cd /d %~dp0
for %%I in (..\..\..) do set ROOT=%%~fI
cd /d %ROOT%
node -e "console.log('CloudBase function verification blocked: MCP AUTH_REQUIRED; /api route intentionally deferred')" > "%~dp0logs\run.log" 2>&1
exit /b %ERRORLEVEL%
