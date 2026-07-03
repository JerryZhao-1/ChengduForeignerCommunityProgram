@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
pushd "%REPO_ROOT%"
(
  echo change-id=add-admin-place-edit-delete run=0003 task=2.1 ref=R3
  call pnpm exec vitest run apps/api/test/app.spec.ts
  call pnpm --filter @community-map/api typecheck
) > "%SCRIPT_DIR%logs\run.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\run.log"
popd
exit /b %EXIT_CODE%

