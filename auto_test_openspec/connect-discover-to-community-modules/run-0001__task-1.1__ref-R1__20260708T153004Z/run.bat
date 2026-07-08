@echo off
setlocal
cd /d "%~dp0"
set "REPO_ROOT=%~dp0..\..\.."
"%REPO_ROOT%\node_modules\.bin\vitest.cmd" run "%REPO_ROOT%\packages\shared\test\contracts.spec.ts" "%REPO_ROOT%\packages\shared\test\client.spec.ts"
"%REPO_ROOT%\node_modules\.bin\tsc.cmd" --noEmit -p "%REPO_ROOT%\packages\shared\tsconfig.json"
