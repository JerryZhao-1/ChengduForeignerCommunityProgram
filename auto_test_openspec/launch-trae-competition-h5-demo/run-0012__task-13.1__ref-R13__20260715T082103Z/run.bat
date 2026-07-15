@echo off
setlocal
pushd "%~dp0"
set "BUNDLE_DIR=%CD%"
pushd "..\..\.."
(
  pnpm --filter @community-map/api typecheck
  if errorlevel 1 exit /b 1
  pnpm exec vitest run apps/api/test/community-plan.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
  if errorlevel 1 exit /b 1
  echo All R13 CLI assertions completed.
) > "%BUNDLE_DIR%\logs\run.log" 2>&1
set "RESULT=%ERRORLEVEL%"
popd
popd
exit /b %RESULT%

