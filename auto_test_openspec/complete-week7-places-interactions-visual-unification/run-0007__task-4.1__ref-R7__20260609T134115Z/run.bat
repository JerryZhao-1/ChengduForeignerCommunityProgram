@echo off
setlocal enabledelayedexpansion
pushd %~dp0
if not exist logs mkdir logs
cd ../../..
set LOG_DIR=auto_test_openspec\complete-week7-places-interactions-visual-unification\run-0007__task-4.1__ref-R7__20260609T134115Z\logs
echo Command: pnpm --filter @community-map/mobile typecheck
pnpm --filter @community-map/mobile typecheck || exit /b 1
echo Command: targeted places tests
pnpm exec vitest run apps/mobile/src/pages/places/list-categories.spec.ts apps/mobile/src/pages/places/navigation.spec.ts apps/mobile/src/pages/places/favorite-state.spec.ts || exit /b 1
echo Command: places visible copy scan
rg -n "pending|reserved|预留|后续版本|入口|Favorite entry|Share entry|Recommended entry" apps/mobile/src/pages/places apps/mobile/src/pages.json
if %ERRORLEVEL% EQU 0 exit /b 1
echo Command: openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive
openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive || exit /b 1
popd
