@echo off
setlocal
pushd "%~dp0\..\..\.."
if errorlevel 1 exit /b 1
call pnpm --filter @community-map/api typecheck || exit /b 1
call node_modules\.bin\vitest.cmd run apps/api/test/community-plan.spec.ts || exit /b 1
call pnpm typecheck || exit /b 1
call pnpm test || exit /b 1
call pnpm lint || exit /b 1
call pnpm --filter @community-map/mobile build:h5 || exit /b 1
call pnpm --filter @community-map/mobile build:mp-weixin || exit /b 1
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive || exit /b 1
findstr /n /c:"scenario_key" apps\api\src\routes\community-plan.ts >nul && exit /b 1
node "%~dp0tests\write-checks.mjs" "%~dp0outputs\checks.json" || exit /b 1
fc /b "%~dp0expected\checks.json" "%~dp0outputs\checks.json" >nul || exit /b 1
echo Worker validation complete; Supervisor verdict remains pending.
popd
exit /b 0
