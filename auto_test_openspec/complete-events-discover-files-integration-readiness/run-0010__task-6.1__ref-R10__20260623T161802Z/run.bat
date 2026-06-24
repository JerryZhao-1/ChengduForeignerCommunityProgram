@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
set RUN_DIR=auto_test_openspec\complete-events-discover-files-integration-readiness\run-0010__task-6.1__ref-R10__20260623T161802Z
openspec validate complete-events-discover-files-integration-readiness --strict --no-interactive > %RUN_DIR%\logs\openspec.log 2>&1
if errorlevel 1 goto done
pnpm exec vitest run packages/shared/test/integration-readiness.spec.ts apps/api/test/integration-readiness.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts > %RUN_DIR%\logs\vitest.log 2>&1
if errorlevel 1 goto done
pnpm --filter @community-map/shared typecheck > %RUN_DIR%\logs\shared-typecheck.log 2>&1
if errorlevel 1 goto done
pnpm --filter @community-map/api typecheck > %RUN_DIR%\logs\api-typecheck.log 2>&1
if errorlevel 1 goto done
pnpm lint > %RUN_DIR%\logs\lint.log 2>&1
if errorlevel 1 (
  echo pnpm lint failed. Review logs\lint.log; generated CloudBase bundle lint is a known scoped blocker when present. > %RUN_DIR%\logs\lint-blocker.txt
) else (
  echo lint exited 0 > %RUN_DIR%\logs\lint-status.txt
)
:done
set EXITCODE=%ERRORLEVEL%
type %RUN_DIR%\logs\openspec.log
type %RUN_DIR%\logs\vitest.log
type %RUN_DIR%\logs\shared-typecheck.log
type %RUN_DIR%\logs\api-typecheck.log
if exist %RUN_DIR%\logs\lint.log type %RUN_DIR%\logs\lint.log
popd
popd
exit /b %EXITCODE%
