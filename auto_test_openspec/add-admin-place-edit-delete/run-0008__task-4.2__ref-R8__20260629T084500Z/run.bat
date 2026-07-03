@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
pushd "%REPO_ROOT%"
(
  echo change-id=add-admin-place-edit-delete run=0008 task=4.2 ref=R8
  call openspec validate add-admin-place-edit-delete --strict --no-interactive
  if not exist "docs\API接口使用手册.md" exit /b 1
  if not exist "docs\已实现API接口清单.md" exit /b 1
  if not exist "docs\openapi\community-map-api.openapi.yaml" exit /b 1
  call pnpm typecheck
  call pnpm test
) > "%SCRIPT_DIR%logs\run.log" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%SCRIPT_DIR%logs\run.log"
popd
exit /b %EXIT_CODE%

