@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
pnpm exec vitest run apps/api/test/integration-readiness.spec.ts apps/api/test/cloudbase.spec.ts -t "keeps public event reads|cloudbase handler parity" > auto_test_openspec\complete-events-discover-files-integration-readiness\run-0002__task-2.1__ref-R2__20260623T161802Z\logs\vitest.log 2>&1
set EXITCODE=%ERRORLEVEL%
type auto_test_openspec\complete-events-discover-files-integration-readiness\run-0002__task-2.1__ref-R2__20260623T161802Z\logs\vitest.log
popd
popd
exit /b %EXITCODE%
