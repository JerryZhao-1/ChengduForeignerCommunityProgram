@echo off
setlocal
cd /d "%~dp0"
set "REPO_ROOT=%~dp0..\..\.."
cd /d "%REPO_ROOT%"
openspec validate --type change connect-discover-to-community-modules --strict --no-interactive
"%REPO_ROOT%\node_modules\.bin\vitest.cmd" run "%REPO_ROOT%\packages\shared\test\contracts.spec.ts" "%REPO_ROOT%\packages\shared\test\client.spec.ts" "%REPO_ROOT%\packages\shared\test\integration-readiness.spec.ts" "%REPO_ROOT%\apps\api\test\integration-readiness.spec.ts"
"%REPO_ROOT%\node_modules\.bin\tsc.cmd" --noEmit -p "%REPO_ROOT%\packages\shared\tsconfig.json"
"%REPO_ROOT%\node_modules\.bin\tsc.cmd" --noEmit -p "%REPO_ROOT%\apps\api\tsconfig.json"
"%REPO_ROOT%\node_modules\.pnpm\node_modules\.bin\vue-tsc.cmd" --noEmit -p "%REPO_ROOT%\apps\mobile\tsconfig.json"
