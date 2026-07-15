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

echo === R17 run-0035 corrected CLI gate: %DATE% %TIME% >> "%LOG%"
echo HEAD: >> "%LOG%"
git rev-parse --short HEAD >> "%LOG%" 2>&1

echo === [1/9] openspec validate >> "%LOG%"
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [2/9] shared typecheck >> "%LOG%"
call pnpm --filter @community-map/shared typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [3/9] api typecheck >> "%LOG%"
call pnpm --filter @community-map/api typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [4/9] mobile typecheck >> "%LOG%"
call pnpm --filter @community-map/mobile typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [5/9] root typecheck >> "%LOG%"
call pnpm typecheck >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [6/9] pnpm test >> "%LOG%"
call pnpm test >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [7/9] pnpm lint >> "%LOG%"
call pnpm lint >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [8/9] mobile build:h5 >> "%LOG%"
call pnpm --filter @community-map/mobile build:h5 >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === [9/9] mobile build:mp-weixin >> "%LOG%"
call pnpm --filter @community-map/mobile build:mp-weixin >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === Focused coverage and parity tests >> "%LOG%"
call .\node_modules\.bin\vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

echo === Build artifact existence >> "%LOG%"
if not exist "apps\mobile\dist\build\h5\index.html" exit /b 1
echo h5/index.html: OK >> "%LOG%"
if not exist "apps\mobile\dist\build\mp-weixin\app.json" exit /b 1
echo mp-weixin/app.json: OK >> "%LOG%"

echo === Forbidden model-runtime marker scan >> "%LOG%"
call rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob "!**/*.map" >> "%LOG%" 2>&1
set "SCAN_RC=!ERRORLEVEL!"
if "!SCAN_RC!"=="0" (
  echo Found a forbidden Community Plan model-runtime artifact. >> "%LOG%"
  exit /b 1
)
if not "!SCAN_RC!"=="1" (
  echo Forbidden-marker scan failed to execute with rg exit !SCAN_RC!. >> "%LOG%"
  exit /b !SCAN_RC!
)
echo No forbidden markers found ^(rg exit 1^). >> "%LOG%"

echo === Production source change and type-escape boundary >> "%LOG%"
for /f "delims=" %%L in ('git status --porcelain -- apps/api/src apps/mobile/src packages/shared/src apps/admin/src') do (
  echo Production source change detected: %%L >> "%LOG%"
  exit /b 1
)
echo Production source unchanged across staged, unstaged, and untracked state. >> "%LOG%"

echo === Consolidated checks >> "%LOG%"
node "%BUNDLE_DIR%\tests\write-checks.mjs" "%BUNDLE_DIR%\outputs\checks.json" >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1
fc "%BUNDLE_DIR%\outputs\checks.json" "%BUNDLE_DIR%\expected\checks.json" > nul
if errorlevel 1 exit /b 1
echo checks.json matches expected. >> "%LOG%"

echo === R17 run-0035 CLI gate complete. >> "%LOG%"
type "%LOG%"
exit /b 0
