@echo off
setlocal
cd /d %~dp0\..\..\..
call openspec validate harden-discover-governance-console --strict --no-interactive
call node_modules\.bin\tsc --noEmit -p packages\shared\tsconfig.json
call node_modules\.bin\tsc --noEmit -p apps\api\tsconfig.json
call apps\admin\node_modules\.bin\vue-tsc --noEmit -p apps\admin\tsconfig.json
call apps\mobile\node_modules\.bin\vue-tsc --noEmit -p apps\mobile\tsconfig.json
call node_modules\.bin\vitest run packages\shared\test\contracts.spec.ts packages\shared\test\client.spec.ts apps\api\test\integration-readiness.spec.ts
