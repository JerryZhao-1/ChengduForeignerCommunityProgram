@echo off
setlocal
pushd "%~dp0"
set "BUNDLE_DIR=%CD%"
pushd "..\..\.."
(
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  if errorlevel 1 exit /b 1
  if exist apps\api\src\lib\community-plan-ai.ts exit /b 1
  rg -n "community-plan-ai|DEEPSEEK|deepseek|generation_source|ai_status" apps\api\src apps\mobile\src packages\shared\src
  if not errorlevel 1 exit /b 1
  echo All R10 CLI assertions completed.
) > "%BUNDLE_DIR%\logs\run.log" 2>&1
set "RESULT=%ERRORLEVEL%"
popd
popd
exit /b %RESULT%

