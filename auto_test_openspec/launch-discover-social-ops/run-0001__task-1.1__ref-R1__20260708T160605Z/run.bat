@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

echo Running shared discover social contract validation > "%SCRIPT_DIR%logs\vitest-shared-contracts.log"
echo Repo: %CD% >> "%SCRIPT_DIR%logs\vitest-shared-contracts.log"
call .\node_modules\.bin\vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts >> "%SCRIPT_DIR%logs\vitest-shared-contracts.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\vitest-shared-contracts.log"
popd
exit /b %EXIT_CODE%
