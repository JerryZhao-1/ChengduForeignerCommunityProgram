@echo off
setlocal
cd /d %~dp0\..\..\..
call node_modules\.bin\tsc --noEmit -p apps\api\tsconfig.json
call node_modules\.bin\vitest run apps\api\test\integration-readiness.spec.ts
