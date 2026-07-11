@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%\..\..\.."
echo H5 URL: http://127.0.0.1:5174
echo Optional local API URL: http://127.0.0.1:8787 (H5 fixture run uses mock mode)
pnpm --filter @community-map/mobile exec uni --force
