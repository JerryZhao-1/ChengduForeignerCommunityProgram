@echo off
setlocal
pushd "%~dp0"
set "BUNDLE_DIR=%CD%"
pushd "..\..\.."
(
  pnpm --filter @community-map/shared typecheck
  if errorlevel 1 exit /b 1
  pnpm --filter @community-map/mobile typecheck
  if errorlevel 1 exit /b 1
  pnpm exec vitest run apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts packages/shared/test/community-plan-engine.spec.ts --reporter=json --outputFile="%BUNDLE_DIR%\outputs\vitest.json"
  if errorlevel 1 exit /b 1
  node "%BUNDLE_DIR%\tests\verify-vitest.mjs" "%BUNDLE_DIR%\outputs\vitest.json"
  if errorlevel 1 exit /b 1
  echo All R15 CLI assertions completed.
) > "%BUNDLE_DIR%\logs\run.log" 2>&1
set "RESULT=%ERRORLEVEL%"
popd
popd
exit /b %RESULT%

