@echo off
setlocal
cd /d "%~dp0"
for %%I in ("%cd%\..\..\..") do set ROOT=%%~fI
if not exist logs mkdir logs
cd /d "%ROOT%"
call node_modules\.bin\tsc --noEmit -p apps\api\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0004__task-1.4__ref-R4__20260707T145642Z\logs\typecheck.log 2>&1 || exit /b 1
call node_modules\.bin\vitest run apps/api/test/cloudbase.spec.ts > auto_test_openspec\complete-discover-core-content-loop\run-0004__task-1.4__ref-R4__20260707T145642Z\logs\vitest-cloudbase.log 2>&1 || exit /b 1
