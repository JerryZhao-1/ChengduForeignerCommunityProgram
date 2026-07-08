@echo off
setlocal
cd /d %~dp0\..\..\..
if not exist auto_test_openspec\harden-discover-governance-console\run-0001__task-1.1__ref-R1__20260707T154950Z\logs mkdir auto_test_openspec\harden-discover-governance-console\run-0001__task-1.1__ref-R1__20260707T154950Z\logs
call node_modules\.bin\tsc --noEmit -p packages\shared\tsconfig.json
call node_modules\.bin\vitest run packages\shared\test\contracts.spec.ts packages\shared\test\client.spec.ts
