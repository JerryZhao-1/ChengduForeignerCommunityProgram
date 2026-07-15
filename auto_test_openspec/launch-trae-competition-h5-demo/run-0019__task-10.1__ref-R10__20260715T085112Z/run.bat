@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set BUNDLE_DIR=%CD%
cd ..\..\..
set REPO_DIR=%CD%
if not exist "%BUNDLE_DIR%\logs" mkdir "%BUNDLE_DIR%\logs"
if not exist "%BUNDLE_DIR%\outputs" mkdir "%BUNDLE_DIR%\outputs"

echo === S07A: AI-free specification migration review === > "%BUNDLE_DIR%\logs\run.log"
echo --- branch --- >> "%BUNDLE_DIR%\logs\run.log"
git branch --show-current >> "%BUNDLE_DIR%\logs\run.log" 2>&1
echo --- HEAD --- >> "%BUNDLE_DIR%\logs\run.log"
git log -1 --oneline >> "%BUNDLE_DIR%\logs\run.log" 2>&1
echo --- openspec validate (strict, no-interactive) --- >> "%BUNDLE_DIR%\logs\run.log"
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive >> "%BUNDLE_DIR%\logs\run.log" 2>&1
echo OPENSPEC_VALIDATE_EXIT=%ERRORLEVEL% >> "%BUNDLE_DIR%\logs\run.log"
echo --- stale-runtime-claim scan: runtime source --- >> "%BUNDLE_DIR%\logs\run.log"
call rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src --glob "!**/*.map" >> "%BUNDLE_DIR%\logs\run.log" 2>&1
if %ERRORLEVEL% EQU 0 (
  echo FOUND_FORBIDDEN_RUNTIME_MARKERS >> "%BUNDLE_DIR%\logs\run.log"
  exit /b 1
) else (
  echo NO_FORBIDDEN_RUNTIME_MARKERS >> "%BUNDLE_DIR%\logs\run.log"
)
echo --- R18 unchecked confirmation --- >> "%BUNDLE_DIR%\logs\run.log"
findstr /C:"- [ ] 18.1" openspec\changes\launch-trae-competition-h5-demo\tasks.md > nul
if %ERRORLEVEL% EQU 0 (
  echo R18_REMAINS_UNCHECKED >> "%BUNDLE_DIR%\logs\run.log"
) else (
  echo R18_UNEXPECTEDLY_CHECKED >> "%BUNDLE_DIR%\logs\run.log"
  exit /b 1
)
echo All S07A checks completed. >> "%BUNDLE_DIR%\logs\run.log"
