@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%\..\..\.."
node scripts/check-bilingual-docs.mjs > "%SCRIPT_DIR%outputs\documentation-check.json"
if errorlevel 1 exit /b 1
pnpm exec prettier --check docs/mobile-bilingual-operations-and-release.md docs/ui-guidelines.md docs/openapi/community-map-api.openapi.yaml scripts/check-bilingual-docs.mjs
if errorlevel 1 exit /b 1
openspec validate complete-mobile-english-language-support --strict --no-interactive
