@echo off
setlocal
set DIR=%~dp0
pushd "%DIR%\..\..\.." || exit /b 1
if not exist "%DIR%\logs" mkdir "%DIR%\logs"
openspec validate add-place-media-source-upload --strict --no-interactive > "%DIR%\logs\openspec-validate.log" 2>&1 || exit /b 1
node_modules\.bin\tsc.cmd --noEmit -p packages\shared\tsconfig.json > "%DIR%\logs\shared-typecheck.log" 2>&1 || exit /b 1
node_modules\.bin\tsc.cmd --noEmit -p apps\api\tsconfig.json > "%DIR%\logs\api-typecheck.log" 2>&1 || exit /b 1
apps\admin\node_modules\.bin\vue-tsc.cmd --noEmit -p apps\admin\tsconfig.json > "%DIR%\logs\admin-typecheck.log" 2>&1 || exit /b 1
apps\mobile\node_modules\.bin\vue-tsc.cmd --noEmit -p apps\mobile\tsconfig.json > "%DIR%\logs\mobile-typecheck.log" 2>&1 || exit /b 1
node_modules\.bin\vitest.cmd run packages\shared\test\contracts.spec.ts packages\shared\test\client.spec.ts apps\api\test\app.spec.ts apps\api\test\cloudbase.spec.ts > "%DIR%\logs\vitest.log" 2>&1 || exit /b 1
if not exist docs\API接口使用手册.md exit /b 1
if not exist docs\已实现API接口清单.md exit /b 1
if not exist docs\Postman调试与OpenAPI导入指南.md exit /b 1
popd
echo Task 5.1 final CLI checks completed. Logs: %DIR%\logs
