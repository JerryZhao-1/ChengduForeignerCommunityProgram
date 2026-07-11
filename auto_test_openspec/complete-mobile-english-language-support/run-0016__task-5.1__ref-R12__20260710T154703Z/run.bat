@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%\..\..\.."
pnpm typecheck || exit /b 1
pnpm test || exit /b 1
pnpm lint || exit /b 1
set VITE_API_MODE=http
set VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api
pnpm --filter @community-map/admin build || exit /b 1
pnpm --filter @community-map/mobile build:h5 || exit /b 1
set VITE_API_MODE=cloudbase-function
set VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0
set VITE_CLOUDBASE_FUNCTION_NAME=community-map-api
pnpm --filter @community-map/mobile build:mp-weixin || exit /b 1
node scripts/check-bilingual-docs.mjs || exit /b 1
pnpm exec vitest run scripts/bilingual-content-audit.spec.ts packages/shared/test/bilingual-contracts.spec.ts || exit /b 1
