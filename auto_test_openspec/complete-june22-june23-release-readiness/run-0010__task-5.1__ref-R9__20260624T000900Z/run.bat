@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

(
  echo Command: openspec validate complete-june22-june23-release-readiness --strict --no-interactive
  call openspec validate complete-june22-june23-release-readiness --strict --no-interactive
) > "%SCRIPT_DIR%logs\openspec-validate.log" 2>&1
if errorlevel 1 exit /b 1

set "TASKS=openspec\changes\complete-june22-june23-release-readiness\tasks.md"
set "ROOT=auto_test_openspec\complete-june22-june23-release-readiness"

(
  echo Checking completed-task evidence...
  if not exist "%ROOT%\run-0002__task-1.1__ref-R1__20260624T000100Z\logs" exit /b 1
  if not exist "%ROOT%\run-0003__task-1.2__ref-R2__20260624T000200Z\logs" exit /b 1
  if not exist "%ROOT%\run-0004__task-2.1__ref-R3__20260624T000300Z\logs" exit /b 1
  if not exist "%ROOT%\run-0008__task-4.1__ref-R7__20260624T000700Z\logs" exit /b 1
  if not exist "%ROOT%\run-0009__task-4.2__ref-R8__20260624T000800Z\logs" exit /b 1
  if not exist "%ROOT%\run-0010__task-5.1__ref-R9__20260624T000900Z\logs" exit /b 1
  echo.
  echo Checking blocker evidence...
  if not exist "%ROOT%\run-0005__task-2.2__ref-R4__20260624T000400Z\logs\blocker.md" exit /b 1
  if not exist "%ROOT%\run-0006__task-2.3__ref-R5__20260624T000500Z\logs\blocker.md" exit /b 1
  if not exist "%ROOT%\run-0007__task-3.1__ref-R6__20260624T000600Z\logs\observed-http.md" exit /b 1
  echo.
  echo Checking task status...
  findstr /C:"- [x] 1.1 Scope generated CloudBase deployment output out of source lint [#R1]" "%TASKS%"
  findstr /C:"- [x] 1.2 Run release validation commands after lint blocker closure [#R2]" "%TASKS%"
  findstr /C:"- [x] 2.1 Build the Mini Program in `cloudbase-function` mode [#R3]" "%TASKS%"
  findstr /C:"- [ ] 2.2 Verify WeChat DevTools import and main flow or record a blocker [#R4]" "%TASKS%"
  findstr /C:"- [ ] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]" "%TASKS%"
  findstr /C:"- [ ] 3.1 Verify Admin hosting reaches the intended CloudBase dev API domain [#R6]" "%TASKS%"
  findstr /C:"- [x] 4.1 Clean or classify dev data and freeze release configuration [#R7]" "%TASKS%"
  findstr /C:"- [x] 4.2 Publish the 6.24 integration handoff and update `docs/plan.md` [#R8]" "%TASKS%"
) > "%SCRIPT_DIR%logs\assertions.log" 2>&1
if errorlevel 1 exit /b 1

(
  echo OpenSpec strict validation passed.
  echo Completed tasks with evidence: 1.1, 1.2, 2.1, 4.1, 4.2, 5.1.
  echo Blocked tasks left unchecked with evidence: 2.2, 2.3, 3.1.
) > "%SCRIPT_DIR%outputs\final-summary.txt"

type "%SCRIPT_DIR%outputs\final-summary.txt"
