@echo off
setlocal
pushd "%~dp0"
set "BUNDLE_DIR=%CD%"
pushd "..\..\.."
(
  pnpm typecheck
  if errorlevel 1 exit /b 1
  pnpm test
  if errorlevel 1 exit /b 1
  pnpm lint
  if errorlevel 1 exit /b 1
  pnpm --filter @community-map/mobile build:h5
  if errorlevel 1 exit /b 1
  pnpm --filter @community-map/mobile build:mp-weixin
  if errorlevel 1 exit /b 1
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  if errorlevel 1 exit /b 1
  if not exist apps\mobile\dist\build\h5\index.html exit /b 1
  if not exist apps\mobile\dist\build\mp-weixin\app.json exit /b 1
  rg -n "community-plan-ai|DEEPSEEK|deepseek|generation_source|ai_status" apps\api\src apps\mobile\src packages\shared\src apps\mobile\dist\build\h5
  if not errorlevel 1 exit /b 1
  node "%BUNDLE_DIR%\tests\write-checks.mjs" "%BUNDLE_DIR%\outputs\checks.json"
  if errorlevel 1 exit /b 1
  echo All R17 worker checks completed; Supervisor decision remains pending.
) > "%BUNDLE_DIR%\logs\run.log" 2>&1
set "RESULT=%ERRORLEVEL%"
popd
popd
exit /b %RESULT%

