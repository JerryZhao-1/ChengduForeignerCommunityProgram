@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts -t "enforces file upload" > auto_test_openspec\complete-events-discover-files-integration-readiness\run-0006__task-4.1__ref-R6__20260623T161802Z\logs\vitest.log 2>&1
set EXITCODE=%ERRORLEVEL%
type auto_test_openspec\complete-events-discover-files-integration-readiness\run-0006__task-4.1__ref-R6__20260623T161802Z\logs\vitest.log
popd
popd
exit /b %EXITCODE%
