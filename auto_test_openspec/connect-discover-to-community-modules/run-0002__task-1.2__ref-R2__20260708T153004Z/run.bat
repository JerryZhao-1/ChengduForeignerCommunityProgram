@echo off
setlocal
cd /d "%~dp0"
set "REPO_ROOT=%~dp0..\..\.."
"%REPO_ROOT%\node_modules\.bin\vitest.cmd" run "%REPO_ROOT%\apps\api\test\integration-readiness.spec.ts"
"%REPO_ROOT%\node_modules\.bin\tsc.cmd" --noEmit -p "%REPO_ROOT%\apps\api\tsconfig.json"
