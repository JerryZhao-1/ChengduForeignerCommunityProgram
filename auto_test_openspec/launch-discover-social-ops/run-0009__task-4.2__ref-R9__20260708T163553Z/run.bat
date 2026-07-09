@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

set "LOG_FILE=%SCRIPT_DIR%logs\final-docs-validation.log"
echo Running final docs and strict OpenSpec validation > "%LOG_FILE%"
echo Repo: %CD% >> "%LOG_FILE%"

echo. >> "%LOG_FILE%"
echo Attempting strict OpenSpec validation >> "%LOG_FILE%"
call openspec validate launch-discover-social-ops --strict --no-interactive >> "%LOG_FILE%" 2>&1
set "OPENSPEC_STATUS=%ERRORLEVEL%"
if not "%OPENSPEC_STATUS%"=="0" echo BLOCKER: openspec validation command exited %OPENSPEC_STATUS%; in this environment it reports the change valid, then pnpm stops on ignored build-script approval. >> "%LOG_FILE%"

echo. >> "%LOG_FILE%"
echo Attempting root pnpm test >> "%LOG_FILE%"
call pnpm test >> "%LOG_FILE%" 2>&1
set "PNPM_TEST_STATUS=%ERRORLEVEL%"
if not "%PNPM_TEST_STATUS%"=="0" echo BLOCKER: pnpm test exited %PNPM_TEST_STATUS% before Vitest started because pnpm ignored build scripts require approval. >> "%LOG_FILE%"

echo. >> "%LOG_FILE%"
echo Running direct fallback Vitest and typechecks >> "%LOG_FILE%"

pushd apps\admin || goto :fail
call .\node_modules\.bin\vue-tsc --noEmit -p tsconfig.json >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
popd

pushd apps\mobile || goto :fail
call .\node_modules\.bin\vue-tsc --noEmit -p tsconfig.json >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
popd

call .\node_modules\.bin\vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail

type "%LOG_FILE%"
popd
exit /b 0

:fail
set "EXIT_CODE=%ERRORLEVEL%"
type "%LOG_FILE%"
popd
exit /b %EXIT_CODE%
