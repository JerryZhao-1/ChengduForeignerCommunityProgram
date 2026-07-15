@echo off
setlocal
pushd %~dp0
set BUNDLE_DIR=%CD%
pushd ..\..\..
call pnpm typecheck || exit /b 1
call pnpm test || exit /b 1
call pnpm lint || exit /b 1
call pnpm --filter @community-map/mobile build:h5 || exit /b 1
call pnpm --filter @community-map/mobile build:mp-weixin || exit /b 1
call node_modules\.bin\vitest.cmd run packages/shared/test/community-plan-engine.spec.ts packages/shared/test/community-plans.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/i18n/catalog.spec.ts || exit /b 1
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive || exit /b 1
if not exist apps\mobile\dist\build\h5\index.html exit /b 1
if not exist apps\mobile\dist\build\mp-weixin\app.json exit /b 1
popd
node "%BUNDLE_DIR%\tests\write-checks.mjs" "%BUNDLE_DIR%\outputs\checks.json" || exit /b 1
echo All R17 worker checks completed; Supervisor decision remains pending.
popd
endlocal
