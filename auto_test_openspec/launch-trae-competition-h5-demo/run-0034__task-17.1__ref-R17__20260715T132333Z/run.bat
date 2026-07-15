@echo off
setlocal enabledelayedexpansion

set "BUNDLE_DIR=%~dp0"
set "BUNDLE_DIR=%BUNDLE_DIR:~0,-1%"
for %%I in ("%BUNDLE_DIR%\..\..\..") do set "REPO_DIR=%%~fI"

if not exist "%BUNDLE_DIR%\logs" mkdir "%BUNDLE_DIR%\logs"
if not exist "%BUNDLE_DIR%\outputs" mkdir "%BUNDLE_DIR%\outputs"

set "LOG=%BUNDLE_DIR%\logs\run.log"

cd /d "%REPO_DIR%"

echo === R17 run-0034 re-gate: %DATE% %TIME% >> "%LOG%"
echo HEAD: >> "%LOG%"
git rev-parse --short HEAD >> "%LOG%" 2>&1
echo. >> "%LOG%"

echo === [1/9] openspec validate >> "%LOG%"
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive >> "%LOG%" 2>&1
if errorlevel 1 (echo openspec validate FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [2/9] shared typecheck >> "%LOG%"
call pnpm --filter @community-map/shared typecheck >> "%LOG%" 2>&1
if errorlevel 1 (echo shared typecheck FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [3/9] api typecheck >> "%LOG%"
call pnpm --filter @community-map/api typecheck >> "%LOG%" 2>&1
if errorlevel 1 (echo api typecheck FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [4/9] mobile typecheck >> "%LOG%"
call pnpm --filter @community-map/mobile typecheck >> "%LOG%" 2>&1
if errorlevel 1 (echo mobile typecheck FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [5/9] root typecheck >> "%LOG%"
call pnpm typecheck >> "%LOG%" 2>&1
if errorlevel 1 (echo root typecheck FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [6/9] pnpm test >> "%LOG%"
call pnpm test >> "%LOG%" 2>&1
if errorlevel 1 (echo pnpm test FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [7/9] pnpm lint >> "%LOG%"
call pnpm lint >> "%LOG%" 2>&1
if errorlevel 1 (echo pnpm lint FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [8/9] mobile build:h5 >> "%LOG%"
call pnpm --filter @community-map/mobile build:h5 >> "%LOG%" 2>&1
if errorlevel 1 (echo mobile build:h5 FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === [9/9] mobile build:mp-weixin >> "%LOG%"
call pnpm --filter @community-map/mobile build:mp-weixin >> "%LOG%" 2>&1
if errorlevel 1 (echo mobile build:mp-weixin FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === Coverage focus tests >> "%LOG%"
call .\node_modules\.bin\vitest run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts >> "%LOG%" 2>&1
if errorlevel 1 (echo coverage focus tests FAILED >> "%LOG%" & exit /b 1)
echo. >> "%LOG%"

echo === Build artifact existence >> "%LOG%"
if not exist "apps\mobile\dist\build\h5\index.html" (echo h5/index.html MISSING >> "%LOG%" & exit /b 1)
echo h5/index.html: OK >> "%LOG%"
if not exist "apps\mobile\dist\build\mp-weixin\app.json" (echo mp-weixin/app.json MISSING >> "%LOG%" & exit /b 1)
echo mp-weixin/app.json: OK >> "%LOG%"
echo. >> "%LOG%"

echo === Forbidden model-runtime marker scan >> "%LOG%"
call rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src apps/mobile/dist/build/h5 --glob "!**/*.map" >> "%LOG%" 2>&1
if not errorlevel 1 (echo Found a forbidden Community Plan model-runtime artifact. >> "%LOG%" & exit /b 1)
echo No forbidden markers found. >> "%LOG%"
echo. >> "%LOG%"

echo === Type-escape scan (no new escapes introduced) >> "%LOG%"
call git diff --exit-code -- apps/api/src apps/mobile/src packages/shared/src apps/admin/src > nul 2>&1
if errorlevel 1 (
  echo Production code was modified; checking for new type escapes in the diff... >> "%LOG%"
  call git diff -- apps/api/src apps/mobile/src packages/shared/src apps/admin/src ^| call rg -n "^\+.*\bas any\b|^\+.*@ts-ignore|^\+.*@ts-nocheck" >> "%LOG%" 2>&1
  if not errorlevel 1 (echo Found a NEW forbidden type escape introduced by this session. >> "%LOG%" & exit /b 1)
  echo Production code modified but no new type escapes introduced. >> "%LOG%"
) else (
  echo Production code unchanged; no new type escapes possible. >> "%LOG%"
)
echo. >> "%LOG%"

echo === Write checks >> "%LOG%"
node "%BUNDLE_DIR%\tests\write-checks.mjs" "%BUNDLE_DIR%\outputs\checks.json" >> "%LOG%" 2>&1
if errorlevel 1 (echo write-checks FAILED >> "%LOG%" & exit /b 1)
fc "%BUNDLE_DIR%\outputs\checks.json" "%BUNDLE_DIR%\expected\checks.json" > nul
if errorlevel 1 (echo checks.json mismatch >> "%LOG%" & exit /b 1)
echo checks.json matches expected. >> "%LOG%"
echo. >> "%LOG%"

echo === All R17 run-0034 Worker CLI checks completed; Supervisor decision remains pending. >> "%LOG%"
type "%LOG%"
exit /b 0
