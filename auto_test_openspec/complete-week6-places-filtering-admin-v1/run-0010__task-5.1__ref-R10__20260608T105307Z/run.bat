@echo off
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%\..\..\.." || exit /b 1
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
(
  echo repo=%CD%
  node --version
  corepack pnpm --version
  echo + corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
  corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
) > "%SCRIPT_DIR%logs\run.log" 2>&1
type "%SCRIPT_DIR%logs\run.log"
popd
