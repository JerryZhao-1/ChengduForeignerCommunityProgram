@echo off
setlocal

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\..
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

openspec validate complete-june22-june23-release-readiness --strict --no-interactive > "%SCRIPT_DIR%logs\openspec-validate.log" 2>&1
if errorlevel 1 exit /b 1

findstr /c:"- [x] 2.2 Verify WeChat DevTools import and main flow or record a blocker [#R4]" openspec\changes\complete-june22-june23-release-readiness\tasks.md >nul || exit /b 1
findstr /c:"- [ ] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]" openspec\changes\complete-june22-june23-release-readiness\tasks.md >nul || exit /b 1
findstr /c:"- [x] 3.1 Verify Admin hosting reaches the intended CloudBase dev API domain [#R6]" openspec\changes\complete-june22-june23-release-readiness\tasks.md >nul || exit /b 1

(
  echo Final OpenSpec validation recheck passed.
  echo Completed tasks: 8/9
  echo Remaining unchecked task: 2.3 real-device places map/navigation/share verification.
) > "%SCRIPT_DIR%outputs\final-summary.txt"

type "%SCRIPT_DIR%outputs\final-summary.txt"
endlocal

