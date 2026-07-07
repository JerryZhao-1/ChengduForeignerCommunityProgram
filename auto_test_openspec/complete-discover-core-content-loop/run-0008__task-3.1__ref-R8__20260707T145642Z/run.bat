@echo off
setlocal
cd /d "%~dp0"
for %%I in ("%cd%\..\..\..") do set ROOT=%%~fI
if not exist logs mkdir logs
cd /d "%ROOT%"
call openspec validate complete-discover-core-content-loop --strict --no-interactive > auto_test_openspec\complete-discover-core-content-loop\run-0008__task-3.1__ref-R8__20260707T145642Z\logs\openspec.log 2>&1 || exit /b 1
call node_modules\.bin\tsc --noEmit -p packages\shared\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0008__task-3.1__ref-R8__20260707T145642Z\logs\shared-typecheck.log 2>&1 || exit /b 1
call node_modules\.bin\tsc --noEmit -p apps\api\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0008__task-3.1__ref-R8__20260707T145642Z\logs\api-typecheck.log 2>&1 || exit /b 1
call apps\mobile\node_modules\.bin\vue-tsc --noEmit -p apps\mobile\tsconfig.json > auto_test_openspec\complete-discover-core-content-loop\run-0008__task-3.1__ref-R8__20260707T145642Z\logs\mobile-typecheck.log 2>&1 || exit /b 1
call node_modules\.bin\vitest run packages/shared/test apps/api/test apps/mobile/src/api/client.spec.ts apps/mobile/src/pages/events/event-signup-state.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts > auto_test_openspec\complete-discover-core-content-loop\run-0008__task-3.1__ref-R8__20260707T145642Z\logs\vitest.log 2>&1 || exit /b 1
