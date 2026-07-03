@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
pushd "%REPO_ROOT%"
(
  echo change-id=add-admin-place-edit-delete run=0005 task=3.1 ref=R5
  call pnpm exec vitest run packages/shared/test/places-admin-lifecycle.spec.ts apps/api/test/app.spec.ts
  call pnpm --filter @community-map/shared typecheck
  call pnpm --filter @community-map/api typecheck
) > "%SCRIPT_DIR%logs\run.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\run.log"
popd
exit /b %EXIT_CODE%

