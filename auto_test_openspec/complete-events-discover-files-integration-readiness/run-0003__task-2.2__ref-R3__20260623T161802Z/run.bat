@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts -t "enforces registration" > auto_test_openspec\complete-events-discover-files-integration-readiness\run-0003__task-2.2__ref-R3__20260623T161802Z\logs\vitest.log 2>&1
set EXITCODE=%ERRORLEVEL%
type auto_test_openspec\complete-events-discover-files-integration-readiness\run-0003__task-2.2__ref-R3__20260623T161802Z\logs\vitest.log
popd
popd
exit /b %EXITCODE%
