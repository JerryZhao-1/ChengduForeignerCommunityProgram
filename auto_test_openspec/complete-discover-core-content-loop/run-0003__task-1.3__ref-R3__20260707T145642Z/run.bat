@echo off
setlocal
cd /d "%~dp0"
for %%I in ("%cd%\..\..\..") do set ROOT=%%~fI
if not exist logs mkdir logs
cd /d "%ROOT%"
call node_modules\.bin\vitest run apps/api/test/integration-readiness.spec.ts > auto_test_openspec\complete-discover-core-content-loop\run-0003__task-1.3__ref-R3__20260707T145642Z\logs\vitest-api.log 2>&1 || exit /b 1
