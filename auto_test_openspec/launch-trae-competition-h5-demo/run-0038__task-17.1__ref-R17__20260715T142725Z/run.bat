@echo off
setlocal enabledelayedexpansion

set "BUNDLE_DIR=%~dp0"
set "BUNDLE_DIR=%BUNDLE_DIR:~0,-1%"
for %%I in ("%BUNDLE_DIR%\..\..\..") do set "REPO_DIR=%%~fI"

if not exist "%BUNDLE_DIR%\logs" mkdir "%BUNDLE_DIR%\logs"
if not exist "%BUNDLE_DIR%\outputs" mkdir "%BUNDLE_DIR%\outputs"
set "LOG=%BUNDLE_DIR%\logs\run.log"
type nul > "%LOG%"
cd /d "%REPO_DIR%"

call openspec validate launch-trae-competition-h5-demo --strict --no-interactive >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/shared typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/api typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/mobile typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm test >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm lint >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/mobile build:h5 >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/mobile build:mp-weixin >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
call .\node_modules\.bin\vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

if not exist "apps\mobile\dist\build\h5\index.html" exit /b 1
if not exist "apps\mobile\dist\build\mp-weixin\app.json" exit /b 1

call rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob "!**/*.map" >> "%LOG%" 2>&1
set "SCAN_RC=!ERRORLEVEL!"
if "!SCAN_RC!"=="0" exit /b 1
if not "!SCAN_RC!"=="1" exit /b !SCAN_RC!

node "%BUNDLE_DIR%\tests\write-checks.mjs" "%BUNDLE_DIR%\outputs\checks.json" >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
fc "%BUNDLE_DIR%\outputs\checks.json" "%BUNDLE_DIR%\expected\checks.json" > nul
if errorlevel 1 exit /b 1

type "%LOG%"
exit /b 0
