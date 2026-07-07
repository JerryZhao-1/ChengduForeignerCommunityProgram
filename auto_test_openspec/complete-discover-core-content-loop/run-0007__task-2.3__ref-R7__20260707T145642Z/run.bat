@echo off
setlocal
cd /d "%~dp0"
for %%I in ("%cd%\..\..\..") do set ROOT=%%~fI
if not exist logs mkdir logs
cd /d "%ROOT%"
call apps\mobile\node_modules\.bin\vue-tsc --noEmit -p apps\mobile\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0007__task-2.3__ref-R7__20260707T145642Z\logs\mobile-typecheck.log 2>&1 || exit /b 1
