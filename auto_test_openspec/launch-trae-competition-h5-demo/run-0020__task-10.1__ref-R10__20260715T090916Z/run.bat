@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "BUNDLE_DIR=%CD%"
cd ..\..\..
set "REPO_DIR=%CD%"
if not exist "%BUNDLE_DIR%\logs" mkdir "%BUNDLE_DIR%\logs"
if not exist "%BUNDLE_DIR%\outputs" mkdir "%BUNDLE_DIR%\outputs"

echo === S07A: corrected AI-free specification migration review === > "%BUNDLE_DIR%\logs\run.log"
echo --- branch --- >> "%BUNDLE_DIR%\logs\run.log"
git branch --show-current >> "%BUNDLE_DIR%\logs\run.log" 2>&1
if errorlevel 1 exit /b !ERRORLEVEL!
echo --- HEAD --- >> "%BUNDLE_DIR%\logs\run.log"
git log -1 --oneline >> "%BUNDLE_DIR%\logs\run.log" 2>&1
if errorlevel 1 exit /b !ERRORLEVEL!

echo --- openspec validate (strict, no-interactive) --- >> "%BUNDLE_DIR%\logs\run.log"
call openspec validate launch-trae-competition-h5-demo --strict --no-interactive >> "%BUNDLE_DIR%\logs\run.log" 2>&1
set "OPEN_EXIT=!ERRORLEVEL!"
echo OPENSPEC_VALIDATE_EXIT=!OPEN_EXIT! >> "%BUNDLE_DIR%\logs\run.log"
if not "!OPEN_EXIT!"=="0" exit /b !OPEN_EXIT!

echo --- stale-runtime-claim scan: runtime source --- >> "%BUNDLE_DIR%\logs\run.log"
call rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src --glob "!**/*.map" >> "%BUNDLE_DIR%\logs\run.log" 2>&1
set "RUNTIME_EXIT=!ERRORLEVEL!"
if "!RUNTIME_EXIT!"=="0" (
  echo FOUND_FORBIDDEN_RUNTIME_MARKERS >> "%BUNDLE_DIR%\logs\run.log"
  exit /b 1
)
if "!RUNTIME_EXIT!"=="1" (
  echo NO_FORBIDDEN_RUNTIME_MARKERS >> "%BUNDLE_DIR%\logs\run.log"
) else (
  echo RUNTIME_SCAN_FAILED=!RUNTIME_EXIT! >> "%BUNDLE_DIR%\logs\run.log"
  exit /b !RUNTIME_EXIT!
)

echo --- stale-runtime-claim scan: product documentation --- >> "%BUNDLE_DIR%\logs\run.log"
call rg -n -i "AI[- ]?(生成|generate|powered|推荐|匹配|驱动)|模型[- ]?(生成|推荐|驱动|调用)|model[- ]?(generates|recommends|drives)" docs/competition --glob "*.md" > "%BUNDLE_DIR%\logs\doc-scan-candidates.log" 2>&1
set "DOC_SCAN_EXIT=!ERRORLEVEL!"
if !DOC_SCAN_EXIT! GTR 1 (
  type "%BUNDLE_DIR%\logs\doc-scan-candidates.log" >> "%BUNDLE_DIR%\logs\run.log"
  echo DOC_SCAN_FAILED=!DOC_SCAN_EXIT! >> "%BUNDLE_DIR%\logs\run.log"
  exit /b !DOC_SCAN_EXIT!
)
call rg -v "无模型调用|没有.*模型调用|无.*AI 生成|GUI 无.*AI 生成|禁止.*模型生成|产品文案声称模型生成" "%BUNDLE_DIR%\logs\doc-scan-candidates.log" >> "%BUNDLE_DIR%\logs\run.log" 2>&1
set "DOC_FILTER_EXIT=!ERRORLEVEL!"
if "!DOC_FILTER_EXIT!"=="0" (
  echo FOUND_STALE_DOC_CLAIM >> "%BUNDLE_DIR%\logs\run.log"
  exit /b 1
)
if "!DOC_FILTER_EXIT!"=="1" (
  echo NO_STALE_DOC_CLAIM >> "%BUNDLE_DIR%\logs\run.log"
) else (
  echo DOC_FILTER_FAILED=!DOC_FILTER_EXIT! >> "%BUNDLE_DIR%\logs\run.log"
  exit /b !DOC_FILTER_EXIT!
)

echo --- R18 unchecked confirmation --- >> "%BUNDLE_DIR%\logs\run.log"
findstr /R /C:"^- \[ \] 18\.1 " openspec\changes\launch-trae-competition-h5-demo\tasks.md > nul
if errorlevel 1 (
  echo R18_UNEXPECTEDLY_CHECKED >> "%BUNDLE_DIR%\logs\run.log"
  exit /b 1
)
echo R18_REMAINS_UNCHECKED >> "%BUNDLE_DIR%\logs\run.log"

echo --- write machine-readable result --- >> "%BUNDLE_DIR%\logs\run.log"
node -e "const fs=require('fs');fs.writeFileSync(process.argv[1],JSON.stringify({openspecValidationExit:0,staleRuntimeMarkers:0,staleDocClaims:0,r18Unchecked:true,finalDecision:'pass'},null,2)+'\n')" "%BUNDLE_DIR%\outputs\result.json" >> "%BUNDLE_DIR%\logs\run.log" 2>&1
if errorlevel 1 exit /b !ERRORLEVEL!
echo All corrected S07A checks completed. >> "%BUNDLE_DIR%\logs\run.log"
exit /b 0
