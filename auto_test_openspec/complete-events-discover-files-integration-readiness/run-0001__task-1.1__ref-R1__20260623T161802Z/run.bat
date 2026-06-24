@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
pnpm exec vitest run packages/shared/test/integration-readiness.spec.ts > auto_test_openspec\complete-events-discover-files-integration-readiness\run-0001__task-1.1__ref-R1__20260623T161802Z\logs\vitest.log 2>&1
set EXITCODE=%ERRORLEVEL%
type auto_test_openspec\complete-events-discover-files-integration-readiness\run-0001__task-1.1__ref-R1__20260623T161802Z\logs\vitest.log
popd
popd
exit /b %EXITCODE%
