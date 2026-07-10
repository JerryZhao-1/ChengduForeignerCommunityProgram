@echo off
setlocal
set SCRIPT_DIR=%~dp0
echo Admin GUI validation server command:
echo   cd /d "%SCRIPT_DIR%..\..\.." ^&^& set VITE_API_MODE=http ^&^& set VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api ^&^& pnpm --filter @community-map/admin dev --host 127.0.0.1 --port 5173
echo Admin URL: http://127.0.0.1:5173/
echo CLI static check: node "%SCRIPT_DIR%tests\test_cli_admin_public_launch.mjs"
echo GUI MCP runbook: "%SCRIPT_DIR%tests\gui_runbook_admin_public_launch.md"
endlocal
