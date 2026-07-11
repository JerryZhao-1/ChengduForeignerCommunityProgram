@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%\..\..\.."
pnpm exec vitest run scripts/bilingual-content-audit.spec.ts packages/shared/test/bilingual-contracts.spec.ts
if errorlevel 1 exit /b 1
pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --types node --strict --skipLibCheck scripts/bilingual-content-audit.ts scripts/bilingual-content-migration.ts
if errorlevel 1 exit /b 1
pnpm --filter @community-map/api exec tsx scripts/bilingual-content-audit.ts --input scripts/fixtures/bilingual-content-audit/valid-production-candidate.json --output "%SCRIPT_DIR%outputs\valid-production-shaped-audit.json"
if errorlevel 1 exit /b 1
pnpm --filter @community-map/api exec tsx scripts/bilingual-content-audit.ts --input scripts/fixtures/bilingual-content-audit/valid-fixture.json --output "%SCRIPT_DIR%outputs\valid-fixture-audit.json"
if errorlevel 1 exit /b 1
pnpm --filter @community-map/api exec tsx scripts/bilingual-content-migration.ts --input scripts/fixtures/bilingual-content-audit/legacy-backfill.json --scope all --report "%SCRIPT_DIR%outputs\migration-dry-run.json"
