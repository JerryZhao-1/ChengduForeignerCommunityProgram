@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

set "HANDOFF=docs\release-readiness-handoff-2026-06-24.md"
set "PLAN=docs\plan.md"

(
  echo Checking handoff sections...
  findstr /C:"## Entry Points" "%HANDOFF%"
  findstr /C:"## Validation Results" "%HANDOFF%"
  findstr /C:"## Data Classification" "%HANDOFF%"
  findstr /C:"## Blockers" "%HANDOFF%"
  findstr /C:"## 6.24 Go/No-Go" "%HANDOFF%"
  echo.
  echo Checking evidence links and blockers...
  findstr /C:"run-0003__task-1.2__ref-R2" "%HANDOFF%"
  findstr /C:"run-0004__task-2.1__ref-R3" "%HANDOFF%"
  findstr /C:"run-0005__task-2.2__ref-R4" "%HANDOFF%"
  findstr /C:"run-0006__task-2.3__ref-R5" "%HANDOFF%"
  findstr /C:"run-0007__task-3.1__ref-R6" "%HANDOFF%"
  findstr /C:"| P0 | WeChat DevTools import/main flow not verified" "%HANDOFF%"
  findstr /C:"| P0 | Real-device places map/navigation/share not verified" "%HANDOFF%"
  findstr /C:"| P0 | Admin hosted domain returns `404 NoSuchKey`" "%HANDOFF%"
  echo.
  echo Checking plan references and checkbox state...
  findstr /C:"docs/release-readiness-handoff-2026-06-24.md" "%PLAN%"
  findstr /C:"- [x] 小程序 cloudbase-function 构建。" "%PLAN%"
  findstr /C:"- [ ] 微信开发者工具导入并跑主流程。" "%PLAN%"
  findstr /C:"- [ ] 真机验证 places map/navigation/share。" "%PLAN%"
  findstr /C:"- [ ] Admin hosting 与 API domain 联调。" "%PLAN%"
  findstr /C:"- [x] 输出 6.24 联调入口、账号、环境、数据清单。" "%PLAN%"
) > "%SCRIPT_DIR%logs\assertions.log" 2>&1
if errorlevel 1 exit /b 1

echo Task 4.2 handoff and plan assertions passed.> "%SCRIPT_DIR%outputs\summary.txt"
type "%SCRIPT_DIR%outputs\summary.txt"
