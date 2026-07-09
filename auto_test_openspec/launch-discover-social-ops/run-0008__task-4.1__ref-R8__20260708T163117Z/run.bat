@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

echo Running CloudBase discover social ops validation > "%SCRIPT_DIR%logs\vitest-cloudbase-social-ops.log"
echo Repo: %CD% >> "%SCRIPT_DIR%logs\vitest-cloudbase-social-ops.log"
call .\node_modules\.bin\vitest run apps/api/test/cloudbase.spec.ts apps/api/test/integration-readiness.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts >> "%SCRIPT_DIR%logs\vitest-cloudbase-social-ops.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\vitest-cloudbase-social-ops.log"
popd
exit /b %EXIT_CODE%
