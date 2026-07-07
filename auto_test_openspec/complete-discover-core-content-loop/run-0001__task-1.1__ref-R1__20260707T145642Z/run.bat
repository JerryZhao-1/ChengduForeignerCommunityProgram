@echo off
setlocal
cd /d "%~dp0"
for %%I in ("%cd%\..\..\..") do set ROOT=%%~fI
if not exist logs mkdir logs
cd /d "%ROOT%"
call node_modules\.bin\tsc --noEmit -p packages\shared\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0001__task-1.1__ref-R1__20260707T145642Z\logs\typecheck.log 2>&1 || exit /b 1
call node_modules\.bin\vitest run packages/shared/test > auto_test_openspec\complete-discover-core-content-loop\run-0001__task-1.1__ref-R1__20260707T145642Z\logs\vitest-shared.log 2>&1 || exit /b 1
