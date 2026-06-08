@echo off
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
(
  echo repo=%CD%
  node --version
  corepack pnpm --version
  echo + corepack pnpm vitest run apps/mobile/src/pages/places/list-categories.spec.ts
  corepack pnpm vitest run apps/mobile/src/pages/places/list-categories.spec.ts
  echo + corepack pnpm --filter @community-map/mobile typecheck
  corepack pnpm --filter @community-map/mobile typecheck
) > "%SCRIPT_DIR%logs\run.log" 2>&1
type "%SCRIPT_DIR%logs\run.log"
popd
