@echo off
setlocal
set DIR=%~dp0
pushd "%DIR%\..\..\.." || exit /b 1
if not exist "%DIR%\logs" mkdir "%DIR%\logs"
node_modules\.bin\tsc.cmd --noEmit -p packages\shared\tsconfig.json > "%DIR%\logs\shared-typecheck.log" 2>&1 || exit /b 1
node_modules\.bin\tsc.cmd --noEmit -p apps\api\tsconfig.json > "%DIR%\logs\api-typecheck.log" 2>&1 || exit /b 1
node_modules\.bin\vitest.cmd run packages\shared\test\contracts.spec.ts apps\api\test\app.spec.ts apps\api\test\cloudbase.spec.ts > "%DIR%\logs\external-media-tests.log" 2>&1 || exit /b 1
popd
echo Task 2.2 CLI checks completed. Logs: %DIR%\logs
