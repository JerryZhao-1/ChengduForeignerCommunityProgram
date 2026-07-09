@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

echo Running discover social provider validation > "%SCRIPT_DIR%logs\vitest-social-provider.log"
echo Repo: %CD% >> "%SCRIPT_DIR%logs\vitest-social-provider.log"
call .\node_modules\.bin\vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts >> "%SCRIPT_DIR%logs\vitest-social-provider.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\vitest-social-provider.log"
popd
exit /b %EXIT_CODE%
