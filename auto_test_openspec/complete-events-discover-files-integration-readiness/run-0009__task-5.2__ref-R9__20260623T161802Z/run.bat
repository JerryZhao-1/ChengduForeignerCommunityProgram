@echo off
setlocal
pushd %~dp0
if not exist logs mkdir logs
pushd ..\..\..
(
  findstr /C:"events public list/detail" docs\plan.md
  findstr /C:"discover public feed/detail" docs\plan.md
  findstr /C:"files 覆盖 public upload" docs\plan.md
  findstr /C:"auth/role/notifications" docs\plan.md
  findstr /C:"targeted Vitest 24 tests passed" docs\plan.md
  findstr /C:"Non-Places Handler Readiness" docs\cloudbase-dev-api-deployment.md
  findstr /C:"do not prove CloudBase live collection persistence" docs\cloudbase-dev-api-deployment.md
  findstr /C:"fallback parity" docs\API接口使用手册.md
  findstr /C:"handler fallback parity" docs\已实现API接口清单.md
) > auto_test_openspec\complete-events-discover-files-integration-readiness\run-0009__task-5.2__ref-R9__20260623T161802Z\logs\docs-grep.log 2>&1
set EXITCODE=%ERRORLEVEL%
type auto_test_openspec\complete-events-discover-files-integration-readiness\run-0009__task-5.2__ref-R9__20260623T161802Z\logs\docs-grep.log
popd
popd
exit /b %EXITCODE%
